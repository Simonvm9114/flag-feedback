import { execSync } from 'node:child_process';

const EXPECTED_REMOTE = 'github.com/Simonvm9114/flag-feedback';

/** Run a shell command and return stdout, or null on failure. */
function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

/** Validate npm registry and optional auth. */
function validateNpm() {
  try {
    execSync('npm ping', { stdio: 'ignore' });
    console.log('npm registry: OK (ping)');
  } catch {
    console.error('npm registry: FAIL — npm ping did not succeed');
    process.exit(1);
  }

  const whoami = run('npm whoami');
  if (whoami) {
    console.log(`npm auth: OK (logged in as ${whoami})`);
    return;
  }
  console.warn(
    'npm auth: SKIP — npm whoami failed; set NPM_TOKEN in .npmrc for local publish (see .npmrc.example)',
  );
}

/** Validate git remote when origin is configured. */
function validateGit() {
  const url = run('git remote get-url origin');
  if (!url) {
    console.warn('git remote: SKIP — no origin (add remote before push to GitHub)');
    return;
  }
  if (!url.includes(EXPECTED_REMOTE)) {
    console.warn(`git remote: WARN — origin is ${url}, expected *${EXPECTED_REMOTE}*`);
    return;
  }
  console.log('git remote: OK');
}

validateNpm();
validateGit();
console.log('All required connectors validated.');
