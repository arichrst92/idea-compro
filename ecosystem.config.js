module.exports = {
  apps: [{
    name: 'idea-website',
    script: 'server.js',
    instances: 'max',           // Use all CPU cores
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    restart_delay: 5000,
    max_restarts: 10,
  }]
};
