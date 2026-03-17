import { NextResponse } from 'next/server'
import { saveOntology } from '@/lib/storage'
import type { OntologyNode, OntologyEdge, NodeType } from '@/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const CLAUDE_MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an ontology engineering expert. You will receive an ontology file in any format (JSON, XML, OWL, Markdown, YAML, Turtle, RDF, or plain text description).

Your task is to convert it into our internal ontology JSON format. Preserve as much of the original structure, labels, and relationships as possible.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "name": "Descriptive Ontology Name",
  "description": "1-2 sentence summary of what this ontology models",
  "domain": "single lowercase word (e.g. healthcare, hiring, finance, education, legal, retail, general)",
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "type": "class|property|value|dimension|relation|constraint",
      "label": "Human Readable Label",
      "description": "What this concept means",
      "semantics": "how this element varies or drives generation",
      "examples": ["example1", "example2"]
    }
  ],
  "edges": [
    {
      "id": "edge_unique_id",
      "source": "node_id",
      "target": "node_id",
      "label": "short relationship label",
      "type": "is_a|has_property|has_value|relates_to|part_of|constrains|instance_of"
    }
  ]
}

Node type guidelines:
- class: main entities or top-level concepts
- property: attributes that characterize a class
- value: specific enumerated values for a property
- dimension: key axes of variation
- relation: meaningful named relationships between entities
- constraint: rules, requirements, or structural invariants

If the input is already in our JSON format, return it as-is (with any missing fields filled in).`

function layoutNodes(nodes: Omit<OntologyNode, 'position'>[]): OntologyNode[] {
  const ROW_Y: Record<NodeType, number> = {
    class: 100, dimension: 350, property: 600, value: 850, relation: 1100, constraint: 1350,
  }
  const GAP_X = 280
  const counters: Record<string, number> = {}
  return nodes.map(n => {
    const type = n.type as NodeType
    const idx = counters[type] ?? 0
    counters[type] = idx + 1
    const sameType = nodes.filter(x => x.type === type).length
    const startX = -(sameType - 1) * GAP_X / 2
    return { ...n, position: { x: startX + idx * GAP_X, y: ROW_Y[type] ?? 600 } }
  })
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const text = Buffer.from(bytes).toString('utf-8').slice(0, 100_000)

  // Try parsing directly as our JSON format first
  if (file.name.endsWith('.json') || file.type === 'application/json') {
    try {
      const parsed = JSON.parse(text)
      if (parsed.nodes && parsed.edges && parsed.name) {
        const now = new Date().toISOString()
        const id = crypto.randomUUID()
        const nodes = layoutNodes((parsed.nodes ?? []) as Omit<OntologyNode, 'position'>[])
        const edges: OntologyEdge[] = (parsed.edges ?? []).map((e: OntologyEdge) => ({
          ...e, id: e.id || crypto.randomUUID(),
        }))
        const ontology = {
          id, name: parsed.name, description: parsed.description ?? '',
          domain: parsed.domain ?? 'general', createdAt: now, updatedAt: now, nodes, edges,
        }
        saveOntology(ontology)
        return NextResponse.json(ontology)
      }
    } catch { /* fall through to Claude */ }
  }

  // Use Claude to convert any other format
  let anthropicResp: Response
  try {
    anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Convert this ontology file (${file.name}) to our JSON format:\n\n${text}`,
        }],
      }),
    })
  } catch (err) {
    return NextResponse.json({ error: `Anthropic API unreachable: ${err}` }, { status: 502 })
  }

  if (!anthropicResp.ok) {
    const err = await anthropicResp.text()
    return NextResponse.json({ error: err }, { status: anthropicResp.status })
  }

  const claudeData = await anthropicResp.json()
  const rawText: string = claudeData.content?.[0]?.text ?? ''

  let parsed: { name: string; description: string; domain: string; nodes: object[]; edges: object[] }
  try {
    const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) ?? rawText.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText
    parsed = JSON.parse(jsonStr)
  } catch {
    return NextResponse.json({ error: 'Failed to parse ontology from Claude response', raw: rawText.slice(0, 500) }, { status: 500 })
  }

  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const nodes = layoutNodes((parsed.nodes ?? []) as Omit<OntologyNode, 'position'>[])
  const edges: OntologyEdge[] = (parsed.edges ?? []).map((e: object) => {
    const edge = e as OntologyEdge
    return { ...edge, id: edge.id || crypto.randomUUID() }
  })

  const ontology = {
    id,
    name: parsed.name ?? file.name,
    description: parsed.description ?? '',
    domain: parsed.domain ?? 'general',
    createdAt: now,
    updatedAt: now,
    nodes,
    edges,
  }

  saveOntology(ontology)
  return NextResponse.json(ontology)
}
