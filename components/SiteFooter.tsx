'use client'

export function SiteFooter() {
  return (
    <footer style={{
      background: '#f5f5f5',
      borderTop: '1px solid #d4d4d4',
      padding: '48px 40px',
      flexShrink: 0,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>

        {/* Column 1 — Brand & legal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a href="https://alpacarelay.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="18" height="25" viewBox="0 0 29 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.80949 39.967C4.84769 39.7018 2.85138 38.885 1.74091 37.4841C1.31639 36.9487 1.21369 36.6906 0.946783 35.4996C-0.276268 30.0349 -0.313613 25.1621 0.830354 20.4045C1.20765 18.8364 1.70467 17.3834 2.328 16.0246C3.277 13.9576 4.63186 12.0073 5.74068 11.112L5.97848 10.9198L5.90873 10.5627C5.80329 10.0239 5.82141 8.33782 5.93949 7.65896C6.15752 6.40755 6.47715 5.43189 7.05215 4.26187C8.25213 1.82217 10.0041 0.139962 11.4814 0.0103909C11.7768 -0.015634 11.8559 0.000424094 12.1206 0.137747C12.6885 0.432328 12.817 0.956703 12.7204 2.58132C12.6204 4.26519 12.4546 5.30785 11.8428 8.09972C11.6028 9.19554 11.4072 10.1175 11.4072 10.1485C11.4078 10.1801 11.4891 10.0189 11.5885 9.79079C11.9954 8.85445 12.5562 8.06318 13.3184 7.34943C13.7314 6.96293 13.7918 6.87766 14.0708 6.28573C14.4487 5.48449 15.2752 3.98335 15.6624 3.3953C16.0957 2.73637 16.7827 1.88031 17.121 1.57632C17.6543 1.09735 18.176 0.932339 18.5462 1.12503C18.7714 1.24242 18.9564 1.51043 19.1009 1.92793C19.3288 2.58797 19.2349 4.29122 18.9103 5.37485C18.8669 5.51938 18.8499 5.63787 18.8724 5.63787C18.8949 5.63787 19.0591 5.58748 19.2376 5.52547C19.951 5.27795 20.615 5.17717 21.5667 5.17219C22.613 5.16665 23.0122 5.24196 23.7487 5.58527C24.6252 5.99391 25.1799 6.54708 25.6072 7.43969C26.2398 8.76253 26.102 10.3257 25.2392 11.6037C24.7746 12.2914 23.8426 13.1043 22.9639 13.5871C22.7091 13.7272 22.5004 13.854 22.5004 13.869C22.5004 13.9531 23.0924 14.5689 23.5241 14.9338C24.1545 15.4664 24.9091 15.9903 26.2003 16.7904C27.8967 17.8414 28.4179 18.3015 28.804 19.0878C28.9962 19.4787 29.0056 19.5214 28.9984 20.0291C28.9946 20.3215 28.9907 20.997 28.9896 21.5308C28.9869 22.641 28.91 23.1239 28.6206 23.847C28.145 25.0364 27.1262 26.2602 25.9531 27.0503C24.8246 27.8111 23.8151 28.2076 22.2609 28.5011C21.6013 28.6262 21.3026 28.7691 21.017 29.0969C20.3091 29.9103 20.4689 31.3151 21.5876 34.1103C22.0627 35.2969 22.1456 35.6286 22.0616 36.0073C21.9479 36.5184 21.4855 37.0218 20.7457 37.4409C18.7648 38.5617 15.2922 39.5207 11.8735 39.8911C10.9503 39.9908 8.57451 40.0357 7.80949 39.967Z" fill="#374151"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>AlpacaRelay</span>
          </a>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>© 2026 Alpaca Relay. All rights reserved.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Privacy policy', href: 'https://alpacarelay.com/legal/privacy-policy' },
              { label: 'Terms of service', href: 'https://alpacarelay.com/legal/terms-of-service' },
              { label: 'Contact us', href: 'https://alpacarelay.com/contact' },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#374151', textDecoration: 'none', fontWeight: 500 }}>
                {label}
              </a>
            ))}
          </div>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { href: 'https://www.instagram.com/alpacarelay_/', label: 'Instagram', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { href: 'https://x.com/AlpacaRelay', label: 'X', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
              { href: 'https://discord.gg/fq6mtPaQNE', label: 'Discord', d: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.12 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.027c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z' },
              { href: 'https://www.facebook.com/profile.php?id=61585314470700', label: 'Facebook', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
            ].map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                title={label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 8,
                  color: '#374151', textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Column 2 — Templates */}
        <FooterColumn title="Templates" links={[
          { label: 'Email templates', href: 'https://alpacarelay.com/email-templates' },
          { label: 'Browse all', href: 'https://alpacarelay.com/email-templates' },
        ]} />

        {/* Column 3 — Industries */}
        <FooterColumn title="Industries" links={[
          { label: 'Retail & e-commerce', href: 'https://alpacarelay.com/industries/retail' },
          { label: 'SaaS & tech', href: 'https://alpacarelay.com/industries/saas' },
          { label: 'Healthcare', href: 'https://alpacarelay.com/industries/healthcare' },
          { label: 'Finance', href: 'https://alpacarelay.com/industries/finance' },
        ]} />

        {/* Column 4 — Solutions */}
        <FooterColumn title="Solutions" links={[
          { label: 'AI email builder', href: 'https://alpacarelay.com/solutions/ai-email-builder' },
          { label: 'Template library', href: 'https://alpacarelay.com/email-templates' },
          { label: 'Pricing', href: 'https://alpacarelay.com/pricing' },
        ]} />
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{title}</p>
      {links.map(({ label, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: '#374151', textDecoration: 'none', fontWeight: 500 }}>
          {label}
        </a>
      ))}
    </div>
  )
}
