/**
 * Lê os leads gravados pelo coletor.
 *
 *   node leads.mjs            → últimos 20, formatados para ler no terminal
 *   node leads.mjs --all      → todos
 *   node leads.mjs --csv      → CSV no stdout (abre no Excel/Sheets)
 *   node leads.mjs --csv > /root/leads.csv
 *
 * O arquivo é JSONL append-only: uma linha JSON por lead. Se uma linha for
 * corrompida (disco cheio no meio de uma escrita, por exemplo), só ela se perde
 * — por isso o parse é tolerante e não aborta tudo.
 */
import { readFile } from 'node:fs/promises';

const ARQUIVO = process.env.LEADS_FILE || '/root/apexvilla/leads/leads.jsonl';
const args = process.argv.slice(2);

let linhas;
try {
  linhas = (await readFile(ARQUIVO, 'utf8')).split('\n').filter(Boolean);
} catch (e) {
  if (e.code === 'ENOENT') { console.log('Nenhum lead ainda.'); process.exit(0); }
  throw e;
}

const leads = [];
let ruins = 0;
for (const l of linhas) {
  try { leads.push(JSON.parse(l)); } catch { ruins++; }
}
if (ruins) console.error(`(aviso: ${ruins} linha(s) ilegível(is), ignorada(s))`);

if (args.includes('--csv')) {
  const cols = ['ts', 'nome', 'telefone', 'email', 'cidade', 'servico', 'mensagem', 'lang', 'origem'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  console.log(cols.join(','));
  for (const l of leads) console.log(cols.map((c) => esc(l[c])).join(','));
  process.exit(0);
}

const mostrar = args.includes('--all') ? leads : leads.slice(-20);
console.log(`\n${leads.length} lead(s) no total — mostrando ${mostrar.length}\n`);
for (const l of mostrar) {
  const quando = new Date(l.ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  console.log(`  ${quando}  ${l.lang === 'es' ? '[ES]' : '[PT]'}  ${l.origem || '/'}`);
  console.log(`    ${l.nome}  ·  ${l.telefone}  ·  ${l.email || '—'}`);
  console.log(`    ${l.servico || '—'}${l.cidade ? '  ·  ' + l.cidade : ''}`);
  if (l.mensagem) console.log(`    "${l.mensagem.slice(0, 90)}${l.mensagem.length > 90 ? '…' : ''}"`);
  console.log();
}
