// Compatibility entry point for deployment systems that expect server/index.js
// This redirects to the proper compiled entry point

const fs = require('fs');
const path = require('path');

// Check for compiled output
const distPath = path.join(__dirname, '..', 'dist', 'index.js');

if (fs.existsSync(distPath)) {
  console.log('Starting server from compiled output:', distPath);
  require(distPath);
} else {
  console.error('Compiled server not found at:', distPath);
  console.error('Make sure to run "npm run build" first.');
  process.exit(1);
}