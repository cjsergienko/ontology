export type NodeType = 'class' | 'property' | 'value' | 'dimension' | 'relation' | 'constraint'

export type EdgeType = 'is_a' | 'has_property' | 'has_value' | 'relates_to' | 'part_of' | 'constrains' | 'instance_of'

export interface OntologyNode {
  id: string
  type: NodeType
  label: string
  description: string
  position: { x: number; y: number }
  semantics?: string
  examples?: string[]
  constraints?: string[]
  metadata?: Record<string, string>
}

export interface OntologyEdge {
  id: string
  source: string
  target: string
  label: string
  type: EdgeType
}

export interface Ontology {
  id: string
  name: string
  description: string
  domain: string
  createdAt: string
  updatedAt: string
  nodes: OntologyNode[]
  edges: OntologyEdge[]
}

export const NODE_COLORS: Record<NodeType, string> = {
  class: '#3b82f6',
  property: '#10b981',
  value: '#8b5cf6',
  dimension: '#f59e0b',
  relation: '#ef4444',
  constraint: '#64748b',
}

export const NODE_LABELS: Record<NodeType, string> = {
  class: 'Class',
  property: 'Property',
  value: 'Value',
  dimension: 'Dimension',
  relation: 'Relation',
  constraint: 'Constraint',
}

export const EDGE_LABELS: Record<EdgeType, string> = {
  is_a: 'is a',
  has_property: 'has property',
  has_value: 'has value',
  relates_to: 'relates to',
  part_of: 'part of',
  constrains: 'constrains',
  instance_of: 'instance of',
}
