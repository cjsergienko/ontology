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
    let line = `  [${n.type}] ${n.label}`
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

function measureNodeCoverage(output: string, o: Ontology) {
  const lower = output.toLowerCase()
  const mentionedSet = new Set(
    o.nodes.filter(n => lower.includes(n.label.toLowerCase())).map(n => n.id)
  )
  const mentionedCount = mentionedSet.size
  return {
    total: o.nodes.length,
    mentioned: mentionedCount,
    pct: o.nodes.length ? Math.round((mentionedCount / o.nodes.length) * 100) : 0,
    nodes: o.nodes.map(n => ({ label: n.label, type: n.type, mentioned: mentionedSet.has(n.id) })),
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ontology = getOntology(id)
  if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt is required' }, { status: 400 })

  const ontologyContext = serializeOntology(ontology)

  const systemPrompt = `You are an expert assistant that uses ontologies as structured knowledge frameworks to generate precise, well-organized responses.

You have been given the following ontology as your knowledge structure. Use it to guide the concepts, terminology, relationships, and organization of your response — but write naturally for the reader, not as a list of node names.

<ontology>
${ontologyContext}
</ontology>

Generate a comprehensive, well-structured response that:
- Reflects the concepts and relationships defined in the ontology
- Uses accurate terminology from the ontology where appropriate
- Is organized in a way that maps to the ontology's structure
- Is practical and readable for a human audience

After your main response, append a dimension map in this exact format — a JSON block wrapped in <dimension_map> tags that maps the key ontology sections/clusters to the specific values used in your response:

<dimension_map>
{
  "SECTION_NAME": {
    "property_key": "value from response"
  }
}
</dimension_map>

Group properties by logical clusters from the ontology (e.g. ROLE IDENTITY, CULTURE FIT, TECHNICAL REQS). Use snake_case keys. Values should be concise — single words or short comma-separated lists extracted directly from what you generated.`

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
        messages: [{ role: 'user', content: prompt }],
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
