module.exports = {
  apps: [{
    name: 'kviz-nextjs',
    script: 'node_modules/.bin/next',
    args: 'start -p 3002 --hostname 127.0.0.1',
    cwd: '/home/openclaw/.openclaw/workspace-domminik/kviz-new',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002,
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/home/openclaw/.pm2/logs/kviz-nextjs-error.log',
    out_file: '/home/openclaw/.pm2/logs/kviz-nextjs-out.log',
    pid_file: '/home/openclaw/.pm2/pids/kviz-nextjs.pid',
    merge_logs: true,
    time: true,
    restart_delay: 5000, // 5 seconds delay before restart
    max_restarts: 10, // max restarts in 60 seconds
    min_uptime: '10s', // minimum uptime to consider app as started
  }]
};