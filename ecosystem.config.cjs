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
  ],
}
