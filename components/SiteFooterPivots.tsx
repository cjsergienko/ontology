'use client'

const ALPACA_PATH = 'M7.80949 39.967C4.84769 39.7018 2.85138 38.885 1.74091 37.4841C1.31639 36.9487 1.21369 36.6906 0.946783 35.4996C-0.276268 30.0349 -0.313613 25.1621 0.830354 20.4045C1.20765 18.8364 1.70467 17.3834 2.328 16.0246C3.277 13.9576 4.63186 12.0073 5.74068 11.112L5.97848 10.9198L5.90873 10.5627C5.80329 10.0239 5.82141 8.33782 5.93949 7.65896C6.15752 6.40755 6.47715 5.43189 7.05215 4.26187C8.25213 1.82217 10.0041 0.139962 11.4814 0.0103909C11.7768 -0.015634 11.8559 0.000424094 12.1206 0.137747C12.6885 0.432328 12.817 0.956703 12.7204 2.58132C12.6204 4.26519 12.4546 5.30785 11.8428 8.09972C11.6028 9.19554 11.4072 10.1175 11.4072 10.1485C11.4078 10.1801 11.4891 10.0189 11.5885 9.79079C11.9954 8.85445 12.5562 8.06318 13.3184 7.34943C13.7314 6.96293 13.7918 6.87766 14.0708 6.28573C14.4487 5.48449 15.2752 3.98335 15.6624 3.3953C16.0957 2.73637 16.7827 1.88031 17.121 1.57632C17.6543 1.09735 18.176 0.932339 18.5462 1.12503C18.7714 1.24242 18.9564 1.51043 19.1009 1.92793C19.3288 2.58797 19.2349 4.29122 18.9103 5.37485C18.8669 5.51938 18.8499 5.63787 18.8724 5.63787C18.8949 5.63787 19.0591 5.58748 19.2376 5.52547C19.951 5.27795 20.615 5.17717 21.5667 5.17219C22.613 5.16665 23.0122 5.24196 23.7487 5.58527C24.6252 5.99391 25.1799 6.54708 25.6072 7.43969C26.2398 8.76253 26.102 10.3257 25.2392 11.6037C24.7746 12.2914 23.8426 13.1043 22.9639 13.5871C22.7091 13.7272 22.5004 13.854 22.5004 13.869C22.5004 13.9531 23.0924 14.5689 23.5241 14.9338C24.1545 15.4664 24.9091 15.9903 26.2003 16.7904C27.8967 17.8414 28.4179 18.3015 28.804 19.0878C28.9962 19.4787 29.0056 19.5214 28.9984 20.0291C28.9946 20.3215 28.9907 20.997 28.9896 21.5308C28.9869 22.641 28.91 23.1239 28.6206 23.847C28.145 25.0364 27.1262 26.2602 25.9531 27.0503C24.8246 27.8111 23.8151 28.2076 22.2609 28.5011C21.6013 28.6262 21.3026 28.7691 21.017 29.0969C20.3091 29.9103 20.4689 31.3151 21.5876 34.1103C22.0627 35.2969 22.1456 35.6286 22.0616 36.0073C21.9479 36.5184 21.4855 37.0218 20.7457 37.4409C18.7648 38.5617 15.2922 39.5207 11.8735 39.8911C10.9503 39.9908 8.57451 40.0357 7.80949 39.967Z'

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/alpacarelay_/',
    d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'Reddit',
    href: 'https://www.reddit.com/r/alpacarelay/',
    d: 'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z',
  },
  {
    label: 'X',
    href: 'https://x.com/AlpacaRelay',
    d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Quora',
    href: 'https://www.quora.com/profile/AlpacaRelay',
    d: 'M12.555 18.367c-.467 1.052-1.112 2.039-2.151 2.039-.317 0-.634-.084-.9-.267l-.567.984c.534.367 1.168.577 1.885.577 1.652 0 2.686-1.167 3.336-2.486A6.933 6.933 0 0 1 12 19.2a6.93 6.93 0 0 1-.445-.018zm-.26-12.367C9.113 6 6 9.113 6 12.295c0 3.183 3.113 5.705 6.295 5.705.676 0 1.326-.11 1.935-.312l.135.26C13.585 19.643 12.738 21 11.37 21c-.534 0-1.068-.15-1.518-.434l-1.285 2.234C9.45 23.583 10.417 24 11.552 24c3.153 0 5.07-3.099 6.064-5.605A7.285 7.285 0 0 0 19.2 12.295C19.2 9.113 16.087 6 12.295 6zm0 1.8c2.43 0 4.405 1.974 4.405 4.495 0 2.22-1.588 4.068-3.693 4.452l-.836-1.62c.6-.318 1.01-.944 1.01-1.666 0-1.043-.846-1.89-1.89-1.89-1.042 0-1.888.847-1.888 1.89 0 .706.39 1.32.966 1.643L9.9 16.386A4.498 4.498 0 0 1 7.89 12.295c0-2.521 1.975-4.495 4.405-4.495z',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/fq6mtPaQNE',
    d: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.12 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.027c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61585314470700',
    d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
]

const FOOTER_COLS = [
  {
    heading: 'TEMPLATES',
    links: [
      { label: 'Announce', href: 'https://alpacarelay.com/templates/announce' },
      { label: 'Sell products', href: 'https://alpacarelay.com/templates/sell-products' },
      { label: 'Invite to event', href: 'https://alpacarelay.com/templates/invite-to-event' },
      { label: 'Sell services', href: 'https://alpacarelay.com/templates/sell-services' },
      { label: 'Seasonal', href: 'https://alpacarelay.com/templates/seasonal' },
      { label: 'Welcome', href: 'https://alpacarelay.com/templates/welcome' },
      { label: 'Thank you', href: 'https://alpacarelay.com/templates/thank-you' },
      { label: 'Newsletter', href: 'https://alpacarelay.com/templates/newsletter' },
      { label: 'Onboarding', href: 'https://alpacarelay.com/templates/onboarding' },
      { label: 'Product update', href: 'https://alpacarelay.com/templates/product-update' },
      { label: 'Browse all templates', href: 'https://alpacarelay.com/templates' },
    ],
  },
  {
    heading: 'INDUSTRIES',
    links: [
      { label: 'E-commerce', href: 'https://alpacarelay.com/industries/ecommerce' },
      { label: 'Retail', href: 'https://alpacarelay.com/industries/retail' },
      { label: 'SaaS products', href: 'https://alpacarelay.com/industries/saas' },
      { label: 'Education', href: 'https://alpacarelay.com/industries/education' },
      { label: 'Healthcare', href: 'https://alpacarelay.com/industries/healthcare' },
      { label: 'Restaurants & cafes', href: 'https://alpacarelay.com/industries/restaurants' },
      { label: 'Nonprofits', href: 'https://alpacarelay.com/industries/nonprofits' },
      { label: 'Real estate', href: 'https://alpacarelay.com/industries/real-estate' },
      { label: 'Tech & IT', href: 'https://alpacarelay.com/industries/tech' },
      { label: 'Browse all industries', href: 'https://alpacarelay.com/industries' },
    ],
  },
  {
    heading: 'SOLUTIONS',
    links: [
      { label: 'For marketers', href: 'https://alpacarelay.com/solutions/marketers' },
      { label: 'For founders & startups', href: 'https://alpacarelay.com/solutions/founders' },
      { label: 'For product managers', href: 'https://alpacarelay.com/solutions/product-managers' },
      { label: 'For HR & people ops', href: 'https://alpacarelay.com/solutions/hr' },
      { label: 'For sales teams', href: 'https://alpacarelay.com/solutions/sales' },
      { label: 'For agencies & freelancers', href: 'https://alpacarelay.com/solutions/agencies' },
      { label: 'For developers & engineers', href: 'https://alpacarelay.com/solutions/developers' },
      { label: 'For speakers & coaches', href: 'https://alpacarelay.com/solutions/speakers' },
      { label: 'For customer success', href: 'https://alpacarelay.com/solutions/customer-success' },
      { label: 'Browse all solutions', href: 'https://alpacarelay.com/solutions' },
    ],
  },
]

export function SiteFooterPivots() {
  return (
    <footer style={{
      background: '#f5f5f5',
      borderTop: '1px solid #d4d4d4',
      padding: '72px 40px 48px',
      flexShrink: 0,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '48px' }}>

          {/* Column 1 — Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <a href="https://alpacarelay.com" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="14" height="20" viewBox="0 0 29 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d={ALPACA_PATH} fill="#171717" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#171717' }}>AlpacaRelay</span>
            </a>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Privacy policy', href: 'https://alpacarelay.com/legal/privacy-policy' },
                { label: 'Terms of service', href: 'https://alpacarelay.com/legal/terms-of-service' },
                { label: 'Data processing addendum', href: 'https://alpacarelay.com/legal/data-processing-addendum' },
                { label: 'Contact us', href: 'https://alpacarelay.com/contact' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#525252', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#525252')}
                >
                  {label}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              {SOCIAL.map(({ href, label, d }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  title={label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '34px', height: '34px', borderRadius: '8px',
                    color: '#171717', textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e5e5e5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#737373' }}>
              © {new Date().getFullYear()} Alpaca Relay. All rights reserved.
            </p>
          </div>

          {/* Columns 2–4 */}
          {FOOTER_COLS.map(col => (
            <div key={col.heading} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#737373', letterSpacing: '0.08em' }}>
                {col.heading}
              </p>
              {col.links.map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#404040', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#404040')}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}

        </div>
      </div>
    </footer>
  )
}
