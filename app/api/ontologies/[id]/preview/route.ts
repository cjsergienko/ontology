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
    let line = `  [${n.type}${isContext ? ':context' : ''}] ${displayLabel}`
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

function measureNodeCoverage(output: string, o: Ontology) {
  const lower = output.toLowerCase()
  const mentionedSet = new Set(
    o.nodes.filter(n => lower.includes(normalizeLabel(n.label))).map(n => n.id)
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

  const systemPrompt = `You are an expert document generator that uses ontologies as structured knowledge frameworks to produce precise, comprehensive outputs.

You have been given the following ontology as your knowledge structure. It defines every concept, dimension, property, and value that should be reflected in your response.

<ontology>
${ontologyContext}
</ontology>

CRITICAL INSTRUCTIONS:
1. Nodes tagged [dimension:context], [property:context], or [class:context] are BACKGROUND KNOWLEDGE ONLY — use them to inform your writing style, tone, and framing, but do NOT create dedicated sections or headings for them. Weave them invisibly into the prose where relevant.
2. All other nodes (without :context) MUST be explicitly addressed with their own content — use the node label as the term in the output.
3. For [value] nodes, use them as concrete choices where relevant (e.g. "senior", "remote").
4. Organize your response to mirror the non-context dimension clusters only.
5. Write for a human reader: natural prose, not a list of node names.
6. Coverage goal: reference at least 70% of non-context nodes explicitly in the output.

After your main response, append a dimension map in this exact format — a JSON block wrapped in <dimension_map> tags:

<dimension_map>
{
  "SECTION_NAME": {
    "property_key": "value from response"
  }
}
</dimension_map>

Group by the ontology's dimension clusters (e.g. ROLE IDENTITY, ORGANIZATION CONTEXT, TECHNICAL REQUIREMENTS). Use snake_case keys matching node labels. Values should be concise — single words or short comma-separated lists extracted directly from what you generated.`

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
