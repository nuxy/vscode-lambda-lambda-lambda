module.exports = {
  apps: [{
    script: '.devcontainer/server.js',
    watch: ['{{appBaseDir}}/src'],
    watch_delay: 1000
  }]
};
