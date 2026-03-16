'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { OntologyNode, NodeType } from '@/lib/types'
import { NODE_COLORS, NODE_LABELS } from '@/lib/types'

export const OntologyNodeComponent = memo(function OntologyNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as OntologyNode
  const color = NODE_COLORS[node.type as NodeType] ?? '#64748b'

  return (
    <div
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${selected ? color : 'var(--border2)'}`,
        borderRadius: 8,
        minWidth: 140,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 12px ${color}40, 0 0 2px ${color}60`
          : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--border2)', border: '2px solid var(--surface)', top: -5 }}
      />

      {/* Type badge + label */}
      <div
        style={{
          borderBottom: `1px solid ${color}30`,
          padding: '7px 10px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
        <span
          style={{
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
          }}
        >
          {NODE_LABELS[node.type as NodeType]}
        </span>
      </div>

      {/* Label */}
      <div style={{ padding: '6px 10px 8px' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text)',
            fontFamily: 'Syne, sans-serif',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {node.label}
        </div>
        {node.description && (
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              marginTop: 3,
              lineHeight: 1.4,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {node.description.length > 60
              ? `${node.description.slice(0, 60)}…`
              : node.description}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--border2)', border: '2px solid var(--surface)', bottom: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: 'var(--border2)', border: '2px solid var(--surface)', right: -5 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: 'var(--border2)', border: '2px solid var(--surface)', left: -5 }}
      />
    </div>
  )
})
