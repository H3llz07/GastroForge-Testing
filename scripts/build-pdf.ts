import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

interface Metadata {
  project: string;
  version: string;
  date: string;
  frozenCommit: string;
  frozenCommitTitle: string;
  institution: string;
  elaboratedBy: string;
  status: string;
}

type DocKind = 'technical' | 'apa';

interface DocSpec {
  name: string;
  kind: DocKind;
}

const ROOT = resolve(import.meta.dirname, '..');
const DOCS_DIR = join(ROOT, 'docs');
const LATEX_DIR = join(DOCS_DIR, 'latex');
const PDF_DIR = join(DOCS_DIR, 'pdf');
const MIKTEX_BIN = 'C:\\Users\\User\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64';

const DOCS: DocSpec[] = [
  { name: 'plan-de-pruebas-gastroforge', kind: 'technical' },
  { name: 'matriz-trazabilidad', kind: 'technical' },
  { name: 'reporte-bugs', kind: 'technical' },
  { name: 'informe-calidad-apa', kind: 'apa' },
];

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): SpawnSyncReturns<string> {
  return spawnSync(cmd, args, { cwd, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function buildEnv(): NodeJS.ProcessEnv {
  const extra = [
    MIKTEX_BIN,
    join(process.env.LOCALAPPDATA ?? '', 'Pandoc'),
    'C:\\Program Files\\Pandoc',
    'C:\\Program Files\\MiKTeX\\miktex\\bin\\x64',
  ].filter((p) => existsSync(p));
  const sep = process.platform === 'win32' ? ';' : ':';
  const pathKey = Object.keys(process.env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
  return { ...process.env, [pathKey]: [...extra, process.env[pathKey] ?? ''].join(sep) };
}

function resolveTool(name: string, env: NodeJS.ProcessEnv): string {
  const probe = run(process.platform === 'win32' ? 'where.exe' : 'which', [name], ROOT, env);
  const first = probe.status === 0 ? probe.stdout.split(/\r?\n/).find((l) => l.trim().length > 0) : undefined;
  if (!first) {
    throw new Error(`Required tool not found on PATH or known install dirs: ${name}`);
  }
  return first.trim();
}

function longDate(date: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!m) return date;
  return `${Number(m[1])} de ${MONTHS[Number(m[2]) - 1]} de ${m[3]}`;
}

function stripHandles(text: string): string {
  return text.replace(/\s*\(@[^)]+\)/g, '').replace(/\s*&\s*/g, ' y ');
}

interface ApaCover {
  title: string;
  authors: string;
  affiliation: string;
  course: string;
  date: string;
}

function parseApaCover(md: string): { cover: ApaCover; body: string } {
  const normalized = md.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const parts = normalized.split(/<\/div>/);
  if (parts.length < 3) {
    throw new Error('informe-calidad-apa.md: expected two centered <div> blocks (cover + repeated title)');
  }
  const lines = parts[0]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('<') && l !== '---');
  const [titleLine, authors, affiliation, course, date] = lines;
  const title = titleLine.replace(/^\*\*|\*\*$/g, '').replace(/`/g, '');
  const repeatedTitle = parts[1].replace(/<div[^>]*>/g, '').replace(/^\s*---\s*$/gm, '').trim();
  const body = [repeatedTitle, ...parts.slice(2)].join('\n').replace(/<div[^>]*>/g, '');
  return { cover: { title, authors, affiliation, course, date }, body };
}

function preprocessTechnical(md: string): { title: string; body: string } {
  const text = md.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const h1 = lines.findIndex((l) => /^# /.test(l));
  const title = h1 >= 0 ? lines[h1].replace(/^# /, '').trim() : 'Documento QA';
  if (h1 >= 0) lines.splice(h1, 1);
  const sub = lines.findIndex((l) => /^## GastroForge/.test(l));
  if (sub >= 0 && sub < 6) lines.splice(sub, 1);
  return { title, body: lines.join('\n') };
}

function buildOne(doc: DocSpec, meta: Metadata, env: NodeJS.ProcessEnv, pandoc: string, latexmk: string | null, xelatex: string): boolean {
  const src = readFileSync(join(DOCS_DIR, `${doc.name}.md`), 'utf8');
  const workDir = join(tmpdir(), `gf-pdf-${doc.name}`);
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });
  const prepared = join(workDir, `${doc.name}.md`);
  const texOut = join(LATEX_DIR, `${doc.name}.tex`);
  const common = [
    '--from', 'gfm+pipe_tables+tex_math_dollars',
    '--to', 'latex',
    '--standalone',
    '--shift-heading-level-by=-1',
    '--lua-filter', join(LATEX_DIR, 'filters.lua'),
    '--wrap=preserve',
    '-o', texOut,
  ];
  let args: string[];
  if (doc.kind === 'technical') {
    const { title, body } = preprocessTechnical(src);
    writeFileSync(prepared, body, 'utf8');
    args = [
      ...common,
      '--template', join(LATEX_DIR, 'technical.tex'),
      '-M', 'pdfmode=technical',
      '-M', `title=${title}`,
      '-M', `project=${meta.project}`,
      '-M', `commit=${meta.frozenCommit}`,
      '-M', `commitTitle=${meta.frozenCommitTitle}`,
      '-M', `institution=${meta.institution}`,
      '-M', `authors=${stripHandles(meta.elaboratedBy)}`,
      '-M', `version=${meta.version}`,
      '-M', `status=${meta.status}`,
      '-M', `date=${longDate(meta.date)}`,
      prepared,
    ];
  } else {
    const { cover, body } = parseApaCover(src);
    writeFileSync(prepared, body, 'utf8');
    args = [
      ...common,
      '--template', join(LATEX_DIR, 'apa7-report.tex'),
      '-M', 'pdfmode=apa',
      '-M', `title=${cover.title}`,
      '-M', `authors=${cover.authors}`,
      '-M', `affiliation=${cover.affiliation}`,
      '-M', `course=${cover.course}`,
      '-M', `date=${cover.date}`,
      prepared,
    ];
  }

  console.log(`[${doc.name}] pandoc -> ${texOut}`);
  const p = run(pandoc, args, ROOT, env);
  if (p.status !== 0) {
    console.error(`[${doc.name}] pandoc failed:\n${p.stderr}`);
    return false;
  }
  if (p.stderr.trim()) console.warn(`[${doc.name}] pandoc warnings:\n${p.stderr.trim()}`);

  const buildDir = join(workDir, 'out');
  mkdirSync(buildDir, { recursive: true });
  const jobname = doc.name;
  let ok = true;
  let log = '';
  const xeArgs = ['-interaction=nonstopmode', '-halt-on-error', '-file-line-error', `-jobname=${jobname}`, `-output-directory=${buildDir}`, texOut];
  if (latexmk) {
    const r = run(latexmk, ['-xelatex', '-interaction=nonstopmode', '-halt-on-error', `-jobname=${jobname}`, `-outdir=${buildDir}`, texOut], LATEX_DIR, env);
    ok = r.status === 0;
    log = (r.stdout ?? '') + (r.stderr ?? '');
  } else {
    for (let pass = 1; pass <= 3 && ok; pass++) {
      console.log(`[${doc.name}] xelatex pass ${pass}/3`);
      const r = run(xelatex, xeArgs, LATEX_DIR, env);
      ok = r.status === 0;
      log = (r.stdout ?? '') + (r.stderr ?? '');
      if (!ok) console.error(log.split('\n').filter((l) => /^!|error|\.tex:\d+/.test(l)).slice(0, 20).join('\n'));
    }
  }
  const builtLog = join(buildDir, `${jobname}.log`);
  if (existsSync(builtLog)) {
    const text = readFileSync(builtLog, 'utf8');
    copyFileSync(builtLog, join(workDir, `${jobname}.log`));
    const missing = text.split('\n').filter((l) => l.includes('Missing character'));
    const overfull = text.split('\n').filter((l) => /Overfull \\hbox \((\d+(\.\d+)?)pt/.test(l)).filter((l) => parseFloat(/\((\d+(\.\d+)?)pt/.exec(l)?.[1] ?? '0') > 20);
    console.log(`[${doc.name}] log: ${missing.length} missing-character, ${overfull.length} overfull hbox > 20pt`);
    missing.slice(0, 5).forEach((l) => console.warn(`  ${l}`));
    overfull.slice(0, 5).forEach((l) => console.warn(`  ${l}`));
  }
  if (!ok) {
    console.error(`[${doc.name}] LaTeX compilation failed (see ${builtLog})`);
    return false;
  }
  const pdf = join(buildDir, `${jobname}.pdf`);
  if (!existsSync(pdf)) {
    console.error(`[${doc.name}] PDF not produced`);
    return false;
  }
  copyFileSync(pdf, join(PDF_DIR, `${doc.name}.pdf`));
  console.log(`[${doc.name}] OK -> docs/pdf/${doc.name}.pdf`);
  return true;
}

function main(): void {
  const meta = JSON.parse(readFileSync(join(ROOT, 'data', 'metadata.json'), 'utf8')) as Metadata;
  mkdirSync(LATEX_DIR, { recursive: true });
  mkdirSync(PDF_DIR, { recursive: true });
  const env = buildEnv();
  const pandoc = resolveTool('pandoc', env);
  const xelatex = resolveTool('xelatex', env);
  let latexmk: string | null = null;
  try {
    const candidate = resolveTool('latexmk', env);
    const probe = run(candidate, ['-v'], ROOT, env);
    latexmk = probe.status === 0 ? candidate : null;
  } catch {
    latexmk = null;
  }
  console.log(`pandoc: ${pandoc}\nxelatex: ${xelatex}\nlatexmk: ${latexmk ?? 'unavailable (Perl missing) -> using xelatex x3'}`);
  let failures = 0;
  for (const doc of DOCS) {
    if (!buildOne(doc, meta, env, pandoc, latexmk, xelatex)) failures++;
  }
  if (failures > 0) {
    console.error(`${failures} document(s) failed to compile`);
    process.exit(1);
  }
  console.log(`All ${DOCS.length} PDFs built in docs/pdf/`);
}

main();
