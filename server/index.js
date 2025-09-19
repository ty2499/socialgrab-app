// Deployment entry point for systems that expect server/index.js
// This file handles both development and production scenarios

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Starting server from deployment entry point...');
console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check different possible locations for the compiled server
const possiblePaths = [
  path.join(__dirname, '..', 'dist', 'index.js'),
  path.join(process.cwd(), 'dist', 'index.js'),
  '/app/dist/index.js'
];

let distPath = null;

for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    distPath = testPath;
    console.log('Found compiled server at:', testPath);
    break;
  }
}

if (distPath) {
  // Try to require the built server
  try {
    require(distPath);
  } catch (error) {
    console.error('Failed to require compiled server:', error.message);
    // Fallback: run via node command
    const nodeProcess = spawn('node', [distPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    nodeProcess.on('exit', (code) => {
      process.exit(code || 0);
    });
  }
} else {
  // If no built version exists, try to build first
  console.log('No compiled server found, attempting to build...');
  console.log('Checked paths:', possiblePaths);
  
  // Check if we have package.json and can run build
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    console.log('Running build process...');
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    buildProcess.on('exit', (code) => {
      if (code === 0) {
        // Build successful, try to start server again
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            console.log('Build complete, starting server from:', testPath);
            try {
              require(testPath);
              return;
            } catch (error) {
              const nodeProcess = spawn('node', [testPath], {
                stdio: 'inherit',
                cwd: process.cwd()
              });
              nodeProcess.on('exit', (code) => {
                process.exit(code || 0);
              });
              return;
            }
          }
        }
        console.error('Build completed but no server file found');
        process.exit(1);
      } else {
        console.error('Build failed with code:', code);
        process.exit(code || 1);
      }
    });
  } else {
    console.error('No package.json found and no compiled server available');
    console.error('Cannot build or start the application');
    process.exit(1);
  }
}