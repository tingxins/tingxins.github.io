import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const postsDir = path.join(root, 'src/content/posts');

const failures = [];

function fail(message) {
  failures.push(message);
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return [full];
  });
}

function parseFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    fail(`${path.relative(root, file)} is missing frontmatter`);
    return null;
  }
  const values = {};
  for (const line of match[1].split('\n')) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    values[pair[1]] = pair[2].trim().replace(/^"|"$/g, '');
  }
  return { values, body: text.slice(match[0].length) };
}

if (!exists('dist/CNAME')) fail('dist/CNAME is missing');
if (exists('dist/CNAME') && read('dist/CNAME').trim() !== 'midaigc.com') fail('dist/CNAME does not contain midaigc.com');
if (!exists('dist/feed.xml')) fail('dist/feed.xml is missing');
if (!exists('dist/sitemap-index.xml') && !exists('dist/sitemap.xml')) fail('dist sitemap is missing');
if (!exists('dist/privacy/iRepeater_privacy.html')) fail('dist privacy page is missing');

const postFiles = listFiles(postsDir).filter((file) => /\.(md|markdown|mdx)$/i.test(file));
for (const file of postFiles) {
  const parsed = parseFrontmatter(file);
  if (!parsed) continue;
  const { values, body } = parsed;
  const date = new Date(values.date);
  if (Number.isNaN(date.valueOf())) {
    fail(`${path.relative(root, file)} has invalid date ${values.date}`);
    continue;
  }
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const urlPath = `dist/${year}/${month}/${values.legacySlug}/index.html`;
  if (!exists(urlPath)) fail(`Missing built post URL ${urlPath}`);

  for (const match of body.matchAll(/(?:!\[[^\]]*\]\(|src=["'])(\/assets\/[^)"']+)/g)) {
    const publicPath = `public${decodeURI(match[1])}`;
    if (!exists(publicPath)) fail(`Missing asset ${match[1]} referenced by ${path.relative(root, file)}`);
  }
}

const distFiles = listFiles(dist).filter((file) => /\.(html|xml|js|css)$/i.test(file));
for (const file of distFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('http://image.tingxins.cn')) {
    fail(`Remaining image.tingxins.cn reference in ${path.relative(root, file)}`);
  }
}

if (failures.length > 0) {
  console.error(`validate:dist failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`validate:dist passed: ${postFiles.length} posts, static files, and mapped assets verified.`);
