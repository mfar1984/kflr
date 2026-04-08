// server.js - cPanel/Passenger friendly Next.js server
const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const port = process.env.PORT || 3000; // Passenger provides PORT

    const server = http.createServer((req, res) => {
      // Delegate to Next.js request handler
      handle(req, res);
    });

    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Next.js server running on port ${port} (env: ${process.env.NODE_ENV || 'development'})`);
      
      // Initialize backup scheduler (only in production after build)
      if (!dev) {
        try {
          // In production, the module is compiled into .next
          // We'll initialize it via API call instead
          console.log('Backup scheduler will initialize on first API call');
        } catch (error) {
          console.error('Failed to initialize backup scheduler:', error);
        }
      }
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start Next.js server:', err);
    process.exit(1);
  });

