import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ontology Builder',
  description: 'Visual ontology, taxonomy & knowledge graph designer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
