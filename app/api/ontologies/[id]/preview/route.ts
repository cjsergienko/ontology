import { NextResponse } from 'next/server'
import { getOntology } from '@/lib/storage'
import type { Ontology } from '@/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const MODEL = 'claude-sonnet-4-6'
const INPUT_PRICE = 3.0   // $ per MTok
const OUTPUT_PRICE = 15.0 // $ per MTok
const CACHE_READ_PRICE = 0.30
const CACHE_WRITE_PRICE = 3.75

function serializeOntology(o: Ontology): string {
  const lines: string[] = [
    `ONTOLOGY: ${o.name}${o.domain ? ` (domain: ${o.domain})` : ''}`,
    o.description ? o.description : '',
    '',
    'NODES:',
  ]
  for (const n of o.nodes) {
    const displayLabel = n.label.replace(/_/g, ' ')
    const isContext = n.metadata?.generate === 'context'
    const fmt = n.metadata?.format
    const len = n.metadata?.length
    let tag = n.type + (isContext ? ':context' : '') + (fmt ? `:${fmt}` : '') + (len ? `:${len}` : '')
    let line = `  [${tag}] ${displayLabel}`
    if (n.description) line += `: ${n.description}`
    if (n.semantics) line += ` — ${n.semantics}`
    if (n.examples?.length) line += ` (e.g. ${n.examples.slice(0, 2).join(', ')})`
    lines.push(line)
  }
  if (o.edges.length) {
    lines.push('', 'RELATIONSHIPS:')
    for (const e of o.edges) {
      const src = o.nodes.find(n => n.id === e.source)?.label ?? e.source
      const tgt = o.nodes.find(n => n.id === e.target)?.label ?? e.target
      lines.push(`  ${src} —[${e.label || e.type}]→ ${tgt}`)
    }
  }
  return lines.filter(l => l !== null).join('\n')
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/_/g, ' ')
}

function sectionPresent(output: string, n: { label: string; metadata?: Record<string, string> }): boolean {
  const lower = output.toLowerCase()
  const aliases = n.metadata?.aliases ? n.metadata.aliases.split(',') : []
  const terms = [normalizeLabel(n.label), ...aliases]
  return terms.some(t => lower.includes(t.trim().toLowerCase()))
}

function measureNodeCoverage(output: string, o: Ontology) {
  // Score only non-context dimension nodes (section-level coverage)
  const scorable = o.nodes.filter(n =>
    n.metadata?.generate !== 'context' && n.type === 'dimension'
  )
  const mentionedSet = new Set(
    scorable.filter(n => sectionPresent(output, n)).map(n => n.id)
  )
  return {
    total: scorable.length,
    mentioned: mentionedSet.size,
    pct: scorable.length ? Math.round((mentionedSet.size / scorable.length) * 100) : 0,
    nodes: o.nodes.map(n => {
      const isScorableDim = n.metadata?.generate !== 'context' && n.type === 'dimension'
      const isExcluded = !isScorableDim
      return {
        label: n.label,
        type: n.type,
        mentioned: isScorableDim ? mentionedSet.has(n.id) : false,
        excluded: isExcluded,
      }
    }),
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { prompt, dataset } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 })

  const ontologyContext = serializeOntology(ontology)

  const systemPrompt = dataset
    ? `You are a document generator. The ontology below is your complete specification — it defines what to generate, how to format each section, what to exclude, and the generation contract in the root node.

<ontology>
${ontologyContext}
</ontology>

A dataset has been provided in the user message inside <dataset> tags. You MUST use that dataset as the sole source of facts and data — extract real values from it, do not invent or hallucinate any information. Apply the ontology structure to organise and present the data from the dataset. Write for a human reader.`
    : `You are a document generator. The ontology below is your complete specification — it defines what to generate, how to format each section, what to exclude, and the generation contract in the root node.

<ontology>
${ontologyContext}
</ontology>

Follow the generation contract in the root node's semantics exactly. Write for a human reader.`

  const userMessage = dataset
    ? `<dataset>\n${dataset}\n</dataset>\n\n${prompt}`
    : prompt

  const t0 = Date.now()
  let resp: Response
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      }),
    })
  } catch (err) {
    return NextResponse.json({ error: `Anthropic API unreachable: ${err}` }, { status: 502 })
  }

  const duration_ms = Date.now() - t0

  if (!resp.ok) {
    const err = await resp.text()
    return NextResponse.json({ error: err }, { status: resp.status })
  }

  const data = await resp.json()
  const raw: string = data.content?.[0]?.text ?? ''

  // Split main output from dimension_map block
  const dimMapMatch = raw.match(/<dimension_map>([\s\S]*?)<\/dimension_map>/)
  const output = raw.replace(/<dimension_map>[\s\S]*?<\/dimension_map>/, '').trimEnd()
  let dimension_map: Record<string, Record<string, string>> = {}
  if (dimMapMatch) {
    try { dimension_map = JSON.parse(dimMapMatch[1].trim()) } catch { /* ignore parse errors */ }
  }
  const u = data.usage ?? {}
  const input_tokens: number = u.input_tokens ?? 0
  const output_tokens: number = u.output_tokens ?? 0
  const cache_read_tokens: number = u.cache_read_input_tokens ?? 0
  const cache_write_tokens: number = u.cache_creation_input_tokens ?? 0

  const cost_usd = (
    (input_tokens / 1e6) * INPUT_PRICE +
    (output_tokens / 1e6) * OUTPUT_PRICE +
    (cache_read_tokens / 1e6) * CACHE_READ_PRICE +
    (cache_write_tokens / 1e6) * CACHE_WRITE_PRICE
  )

  return NextResponse.json({
    output,
    duration_ms,
    usage: { input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd: Math.round(cost_usd * 1e6) / 1e6 },
    node_coverage: measureNodeCoverage(output, ontology),
    dimension_map,
    model: MODEL,
  })
}
