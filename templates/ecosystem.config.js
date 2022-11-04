module.exports = {
  apps: [{
    script: '.devcontainer/server.js',
    watch: ['{{appName}}/src'],
    watch_delay: 1000
  }]
};
