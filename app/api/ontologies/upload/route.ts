import { NextResponse } from 'next/server'
import { saveOntology } from '@/lib/storage'
import { sseStream } from '@/lib/sse'
import type { OntologyNode, OntologyEdge, NodeType } from '@/lib/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const CLAUDE_MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `You are an ontology engineering expert. You will receive one or more example documents of the same type (e.g. several job descriptions, medical records, contracts, research papers, etc.).

Your task is NOT to describe the content of these specific documents — your task is to extract the **generative ontology**: the set of entities, dimensions, properties, and relationships that define *this kind of document* as a class, so the ontology can be used as a structured knowledge framework to generate new similar documents from a fresh prompt.

Think of it as reverse-engineering the schema behind the document type.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "name": "Descriptive Ontology Name",
  "description": "1-2 sentence summary of the document type this ontology models and what it is used to generate",
  "domain": "single lowercase word (e.g. healthcare, hiring, finance, education, legal, retail)",
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "type": "class|property|value|dimension|relation|constraint",
      "label": "Human Readable Label",
      "description": "What this concept means in the context of this document type",
      "semantics": "how this element varies across examples or drives generation",
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
- class: main entities or document sections (e.g. Role, Candidate, Employer, Section)
- property: attributes that characterize a class and vary per document instance
- value: specific enumerated values for a property (e.g. seniority levels, contract types)
- dimension: key axes of variation that differentiate document instances
- relation: meaningful named relationships between entities
- constraint: rules, requirements, or structural invariants of this document type

Aim for 25–45 nodes covering the full breadth of what defines this document type. Make the graph well-connected so it can meaningfully guide generation.`

function layoutNodes(nodes: Omit<OntologyNode, 'position'>[]): OntologyNode[] {
  const ROW_Y: Record<NodeType, number> = {
    class: 100,
    dimension: 350,
    property: 600,
    value: 850,
    relation: 1100,
    constraint: 1350,
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

function fileToContentBlock(name: string, mime: string, bytes: ArrayBuffer, index: number): object[] {
  const base64 = Buffer.from(bytes).toString('base64')
  const isImage = mime.startsWith('image/')
  const isPdf = mime === 'application/pdf'
  const isText = mime.startsWith('text/') || ['application/json', 'application/yaml', 'application/xml'].some(t => mime.includes(t))
  const label = `<example_${index + 1} filename="${name}">`
  const endLabel = `</example_${index + 1}>`

  if (isPdf) {
    return [
      { type: 'text', text: label },
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
      { type: 'text', text: endLabel },
    ]
  } else if (isImage) {
    return [
      { type: 'text', text: label },
      { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
      { type: 'text', text: endLabel },
    ]
  } else {
    let text: string
    if (isText) {
      text = Buffer.from(bytes).toString('utf-8').slice(0, 80_000)
    } else {
      try { text = Buffer.from(bytes).toString('utf-8').slice(0, 80_000) }
      catch { text = `[Binary file: ${name}, ${bytes.byteLength} bytes]` }
    }
    return [{ type: 'text', text: `${label}\n${text}\n${endLabel}` }]
  }
}

export async function POST(req: Request) {
  const { getSessionUser } = await import('@/lib/authHelper')
  const { getUserByEmail, canAnalyze, incrementAnalyzeCount } = await import('@/lib/users')

  const sessionUser = await getSessionUser()
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = getUserByEmail(sessionUser.email)!

  if (!canAnalyze(sessionUser.email)) {
    const { getPlanLimits } = await import('@/lib/plans')
    const limits = getPlanLimits(user.plan as Parameters<typeof getPlanLimits>[0])
    return NextResponse.json(
      { error: `Analyze limit reached: your ${user.plan} plan allows ${limits.analyzePerMonth} document analyses/month. Upgrade to analyze more.` },
      { status: 403 },
    )
  }

  const formData = await req.formData()
  const files = formData.getAll('file') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

  // Build content blocks for all files
  const contentBlocks: object[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const bytes = await file.arrayBuffer()
    const mime = file.type || 'application/octet-stream'
    contentBlocks.push(...fileToContentBlock(file.name, mime, bytes, i))
  }

  const instruction = files.length === 1
    ? `Analyze this example document and extract the generative ontology for this document type.`
    : `Analyze these ${files.length} example documents of the same type. Identify the common entities, dimensions, properties, and relationships that define this document class. Extract the generative ontology.`

  contentBlocks.push({ type: 'text', text: instruction })

  const defaultName = files.length === 1 ? files[0].name : `${files.length} examples`

  return sseStream(async () => {
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: contentBlocks }],
      }),
    })

    if (!anthropicResp.ok) throw new Error(await anthropicResp.text())

    const claudeData = await anthropicResp.json()
    const rawText: string = claudeData.content?.[0]?.text ?? ''

    const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) ?? rawText.match(/(\{[\s\S]*\})/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : rawText) as { name?: string; description?: string; domain?: string; nodes: object[]; edges: object[] }

    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    const nodes = layoutNodes((parsed.nodes ?? []) as Omit<OntologyNode, 'position'>[])
    const edges: OntologyEdge[] = (parsed.edges ?? []).map((e: object) => {
      const edge = e as OntologyEdge
      return { ...edge, id: edge.id || crypto.randomUUID() }
    })

    const ontology = {
      id,
      name: parsed.name ?? defaultName,
      description: parsed.description ?? '',
      domain: parsed.domain ?? 'general',
      createdAt: now,
      updatedAt: now,
      nodes,
      edges,
    }

    saveOntology(ontology, user.id)
    incrementAnalyzeCount(sessionUser.email)
    return ontology
  })
}
