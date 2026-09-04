/**
 * start.js — SchemeSetu Unified 1-Line Launcher
 * ─────────────────────────────────────────────────────────────────────────────
 * Launches both Backend API (Port 5000) and Frontend Vite SPA (Port 5173)
 * concurrently in a single terminal process.
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 STARTING SCHEMESETU FULL-STACK APPLICATION');
console.log('   • Backend API Server: http://localhost:5000');
console.log('   • Frontend Web App:   http://localhost:5173');
console.log('====================================================\n');

// Start Backend
const backend = spawn('node', ['backend/src/server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

// Start Frontend
const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'frontend'),
});

process.on('SIGINT', () => {
  console.log('\nStopping SchemeSetu services...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
