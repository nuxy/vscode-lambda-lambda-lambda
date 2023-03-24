module.exports = {
  apps: [{
    script: '.devcontainer/server.js',
    error_file : '.devcontainer/error.log',
    out_file : '.devcontainer/debug.log',
    watch: ['restfulApiHandler/src'],
    watch_delay: 1000
  }]
};
