module.exports = {
  apps: [{
    name: 'viralizaia',
    script: 'server.js',
    cwd: '/root/viralizaia/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
