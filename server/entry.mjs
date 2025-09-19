import fs from 'node:fs';
import path from 'node:path';

// Check for compiled output files in order of preference
const possiblePaths = [
  'dist/index.js',
  'dist/server/index.js'
];

let targetFile = null;

for (const filePath of possiblePaths) {
  if (fs.existsSync(filePath)) {
    targetFile = filePath;
    console.log(`Found compiled server at: ${filePath}`);
    break;
  }
}

if (!targetFile) {
  console.error('No compiled server file found. Expected one of:', possiblePaths);
  console.error('Make sure to run "npm run build" first.');
  process.exit(1);
}

// Import and start the server
try {
  await import('../' + targetFile);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}