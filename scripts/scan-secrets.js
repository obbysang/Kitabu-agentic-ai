const fs = require('fs');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// Patterns to look for
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key', regex: /-----BEGIN PRIVATE KEY-----/ },
  { name: 'Private Key (RSA)', regex: /-----BEGIN RSA PRIVATE KEY-----/ },
  { name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: 'Generic API Key', regex: /api_key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i },
  { name: 'Generic Secret', regex: /secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i },
];

try {
  // Get staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);

  let hasError = false;

  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) continue;

    // Skip lock files and this script
    if (file.includes('lock.json') || file.includes('scan-secrets.js')) continue;

    const content = fs.readFileSync(file, 'utf-8');

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        console.error(`${RED}ERROR: Potential secret found in ${file}${RESET}`);
        console.error(`  Match: ${pattern.name}`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error(`\n${RED}Commit blocked due to potential secrets. Remove them or use --no-verify to bypass.${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}No secrets found in staged files.${RESET}`);
  }

} catch (error) {
  // If git command fails (e.g. no repo), just warn and exit success
  console.warn('Warning: Could not scan for secrets (not a git repo?)');
  process.exit(0);
}
