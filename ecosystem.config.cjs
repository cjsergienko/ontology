module.exports = {
  apps: [
    {
      name: 'ontology-builder',
      script: 'npm',
      args: 'run dev -- --port 3900',
      cwd: '/Users/sserg/ontology',
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'tunnel-ontology-live',
      script: 'cloudflared',
      args: 'tunnel --config /Users/sserg/.cloudflared/config-ontology-live.yml run',
      autorestart: true,
      watch: false,
    },
  ],
}
