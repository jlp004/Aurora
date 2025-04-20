// prisma/seed.js
const { spawn } = require('child_process');

const child = spawn('npx', ['ts-node', 'prisma/seed.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Seed process exited with code ${code}`);
    process.exit(code);
  }
});
