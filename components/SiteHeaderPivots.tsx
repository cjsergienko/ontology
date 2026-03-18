'use client'

const AlpacaSVG = () => (
  <svg width="22" height="30" viewBox="0 0 29 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.80949 39.967C4.84769 39.7018 2.85138 38.885 1.74091 37.4841C1.31639 36.9487 1.21369 36.6906 0.946783 35.4996C-0.276268 30.0349 -0.313613 25.1621 0.830354 20.4045C1.20765 18.8364 1.70467 17.3834 2.328 16.0246C3.277 13.9576 4.63186 12.0073 5.74068 11.112L5.97848 10.9198L5.90873 10.5627C5.80329 10.0239 5.82141 8.33782 5.93949 7.65896C6.15752 6.40755 6.47715 5.43189 7.05215 4.26187C8.25213 1.82217 10.0041 0.139962 11.4814 0.0103909C11.7768 -0.015634 11.8559 0.000424094 12.1206 0.137747C12.6885 0.432328 12.817 0.956703 12.7204 2.58132C12.6204 4.26519 12.4546 5.30785 11.8428 8.09972C11.6028 9.19554 11.4072 10.1175 11.4072 10.1485C11.4078 10.1801 11.4891 10.0189 11.5885 9.79079C11.9954 8.85445 12.5562 8.06318 13.3184 7.34943C13.7314 6.96293 13.7918 6.87766 14.0708 6.28573C14.4487 5.48449 15.2752 3.98335 15.6624 3.3953C16.0957 2.73637 16.7827 1.88031 17.121 1.57632C17.6543 1.09735 18.176 0.932339 18.5462 1.12503C18.7714 1.24242 18.9564 1.51043 19.1009 1.92793C19.3288 2.58797 19.2349 4.29122 18.9103 5.37485C18.8669 5.51938 18.8499 5.63787 18.8724 5.63787C18.8949 5.63787 19.0591 5.58748 19.2376 5.52547C19.951 5.27795 20.615 5.17717 21.5667 5.17219C22.613 5.16665 23.0122 5.24196 23.7487 5.58527C24.6252 5.99391 25.1799 6.54708 25.6072 7.43969C26.2398 8.76253 26.102 10.3257 25.2392 11.6037C24.7746 12.2914 23.8426 13.1043 22.9639 13.5871C22.7091 13.7272 22.5004 13.854 22.5004 13.869C22.5004 13.9531 23.0924 14.5689 23.5241 14.9338C24.1545 15.4664 24.9091 15.9903 26.2003 16.7904C27.8967 17.8414 28.4179 18.3015 28.804 19.0878C28.9962 19.4787 29.0056 19.5214 28.9984 20.0291C28.9946 20.3215 28.9907 20.997 28.9896 21.5308C28.9869 22.641 28.91 23.1239 28.6206 23.847C28.145 25.0364 27.1262 26.2602 25.9531 27.0503C24.8246 27.8111 23.8151 28.2076 22.2609 28.5011C21.6013 28.6262 21.3026 28.7691 21.017 29.0969C20.3091 29.9103 20.4689 31.3151 21.5876 34.1103C22.0627 35.2969 22.1456 35.6286 22.0616 36.0073C21.9479 36.5184 21.4855 37.0218 20.7457 37.4409C18.7648 38.5617 15.2922 39.5207 11.8735 39.8911C10.9503 39.9908 8.57451 40.0357 7.80949 39.967Z" fill="#171717"/>
  </svg>
)

const NAV_LINKS = [
  { label: 'Email templates', href: 'https://alpacarelay.com/email-templates' },
  { label: 'Industries', href: 'https://alpacarelay.com/industries' },
  { label: 'Solutions', href: 'https://alpacarelay.com/solutions' },
]

export function SiteHeaderPivots() {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      height: '60px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <a href="https://alpacarelay.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <AlpacaSVG />
        <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 600, fontSize: '15px', color: '#171717', letterSpacing: '-0.01em' }}>
          AlpacaRelay
        </span>
      </a>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {NAV_LINKS.map(item => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '14px',
              color: '#171717',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a
          href="https://alpacarelay.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            color: '#171717',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Pricing
        </a>
        <a
          href="https://alpacarelay.com/login"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            color: '#171717',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Log in
        </a>
        <a
          href="https://alpacarelay.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '14px',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '7px 16px',
            borderRadius: '6px',
            background: '#171717',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
          onMouseLeave={e => (e.currentTarget.style.background = '#171717')}
        >
          Sign up
        </a>
      </div>
    </header>
  )
}
