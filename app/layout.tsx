import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeaderPivots } from '@/components/SiteHeaderPivots'
import { SiteFooterPivots } from '@/components/SiteFooterPivots'

export const metadata: Metadata = {
  title: 'ontology.live — Visual Ontology & Knowledge Graph Designer',
  description: 'Design ontologies, taxonomies, and knowledge graphs visually. The structural backbone for AI agent pipelines.',
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = (await headers()).get('host') ?? ''
  const isHiringAIHelp = host.includes('hiringaihelp.com')

  return (
    <html lang="en">
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QN69YV0RFG" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-QN69YV0RFG');
        `}</Script>
        {isHiringAIHelp ? <SiteHeaderPivots /> : <SiteHeader />}
        <main>{children}</main>
        {isHiringAIHelp ? <SiteFooterPivots /> : <SiteFooter />}
      </body>
    </html>
  )
}
