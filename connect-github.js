const projectId = process.argv[2] || 'prj_KrpGqB5wGCgT3LA77k0XYbCsU8U3';
const repoFull = process.argv[3] || 'sireeshkurlapalli/equity-tracker';
const githubToken = process.argv[4] || process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;

const GITHUB_API = 'https://api.github.com';
const VERCEL_API = 'https://api.vercel.com';

async function main() {
  console.log('Connecting GitHub ↔ Vercel for auto-deploys...');
  console.log(`Repo: ${repoFull}`);
  console.log(`Vercel project: ${projectId}`);
  console.log('');

  if (!githubToken) {
    console.error('GitHub token required. Set GITHUB_TOKEN env var.');
    process.exit(1);
  }

  // Check if repo exists
  console.log('[1/3] Checking GitHub repo...');
  try {
    await githubGet('/repos/' + repoFull);
    console.log('  ✓ Repo exists');
  } catch {
    console.log('  Creating repo...');
    try {
      const created = await githubPost('/user/repos', {
        name: repoFull.split('/')[1],
        private: false,
        description: 'EquityPulse — Real-time NSE portfolio tracker',
        auto_init: false,
      });
      console.log('  ✓ Created: ' + created.html_url);
    } catch (err) {
      console.error('  ✗ Failed:', err.message);
      process.exit(1);
    }
  }

  // Connect via Vercel (if token available)
  if (vercelToken) {
    console.log('[2/3] Connecting to Vercel (automated)...');
    try {
      await vercelPatch('/v12/projects/' + projectId, {
        git: { integrated: true, repo: repoFull, owner: repoFull.split('/')[0] },
      });
      console.log('  ✓ Connected');
    } catch (err) {
      console.log('  ✗ Auto-connect failed, will do manual');
    }
  } else {
    console.log('[2/3] Vercel token not set — manual step needed');
  }

  console.log('[3/3] DONE');
  console.log('');
  console.log('If not fully automated, complete these steps:');
  console.log('  1. Open: https://vercel.com/sireeshkk-3651/equity-tracker/settings');
  console.log('  2. Git Repository section → Connect Git Repository');
  console.log('  3. Find ' + repoFull + ' → Connect');
  console.log('  4. If repo not visible, install Vercel GitHub App:');
  console.log('     https://github.com/apps/vercel/installations/new');
  console.log('');
  console.log('After connect: every git push to main auto-deploys in ~30s.');
}

async function githubGet(path) {
  const res = await fetch(GITHUB_API + path, {
    headers: { 'Authorization': 'Bearer ' + githubToken, 'Accept': 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error((await res.text()) || 'GitHub error');
  return res.json();
}

async function githubPost(path, body) {
  const res = await fetch(GITHUB_API + path, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + githubToken, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'GitHub error');
  return res.json();
}

async function vercelPatch(path, body) {
  if (!vercelToken) throw new Error('No Vercel token');
  const res = await fetch(VERCEL_API + path, {
    method: 'PATCH',
    headers: { 'Authorization': 'Bearer ' + vercelToken, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Vercel error');
  return res.json();
}

main().catch(e => { console.error(e); process.exit(1); });
