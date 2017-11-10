const StaticServer = require('static-server');

const server = new StaticServer({
  rootPath: './public/',
  port: 3000
});

server.start(() => {
  console.log('Static server started on port ' + server.port + '...');
});
