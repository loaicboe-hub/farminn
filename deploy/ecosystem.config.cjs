module.exports = {
  apps: [
    {
      name: 'farminn',
      script: 'server.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};

