/** Coletor público ApexVilla. Dados e processo limitados; sem dependências. */
import { createServer } from 'node:http';
import { clientIp, proxiesConfiaveis } from './client-ip.mjs';
import { gravarLead } from './storage.mjs';

const PORT = Number(process.env.PORT || 8099);
const HOST = process.env.HOST || '0.0.0.0';
const ARQUIVO = process.env.LEADS_FILE || '/data/leads.jsonl';
const MAX_BODY = 8192;
const MAX_IPS = 5000;
const MAX_POR_IP = 5;
const JANELA_MS = 60_000;
const origem = process.env.PUBLIC_ORIGIN || 'https://apexvilla.com.br';
const trustedProxies = proxiesConfiaveis(process.env.TRUSTED_PROXY_IPS);
const hits = new Map();

function excedeuLimite(ip) {
  const agora = Date.now();
  let bucket = hits.get(ip);
  if (!bucket || bucket.ate <= agora) {
    // Nunca apagar cotas ativas para abrir espaço a um flood de novas chaves.
    if (hits.size >= MAX_IPS) for (const [key, value] of hits) if (value.ate <= agora) hits.delete(key);
    if (!bucket && hits.size >= MAX_IPS) return true;
    bucket = { ate: agora + JANELA_MS, total: 0 };
    hits.set(ip, bucket);
  }
  if (bucket.total >= MAX_POR_IP) return true;
  bucket.total++;
  return false;
}

const limpar = (v, max) => typeof v === 'string'
  ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let tamanho = 0, excesso = false;
    const chunks = [];
    req.on('data', chunk => {
      if (excesso) return;
      tamanho += chunk.length;
      if (tamanho > MAX_BODY) {
        excesso = true; chunks.length = 0;
        reject(Object.assign(new Error('body_too_large'), { code: 'BODY_TOO_LARGE' }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => { if (!excesso) resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const fim = (code, body) => {
    res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store',
      'x-content-type-options': 'nosniff', ...(code === 429 ? { 'retry-after': '60' } : {}),
      ...(code === 413 ? { connection: 'close' } : {}) });
    res.end(body ? JSON.stringify(body) : '');
  };
  try {
    if (req.url === '/health' && req.method === 'GET') return fim(200, { ok: true });
    if (req.method !== 'POST' || req.url?.split('?')[0] !== '/api/lead') return fim(404, { erro: 'not found' });
    if ((req.headers.origin && req.headers.origin !== origem) || req.headers['sec-fetch-site'] === 'cross-site') {
      return fim(403, { erro: 'origem não permitida' });
    }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return fim(415, { erro: 'envie JSON' });
    const ip = clientIp(req, trustedProxies);
    if (excedeuLimite(ip)) return fim(429, { erro: 'muitas tentativas' });
    if (Number(req.headers['content-length']) > MAX_BODY) { req.resume(); return fim(413, { erro: 'corpo grande demais' }); }
    let corpo;
    try { corpo = JSON.parse(await lerCorpo(req)); }
    catch (error) { return fim(error.code === 'BODY_TOO_LARGE' ? 413 : 400, { erro: 'JSON inválido ou grande demais' }); }
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) return fim(422, { erro: 'envie um objeto' });
    const lead = {
      ts: new Date().toISOString(), nome: limpar(corpo.name, 120), telefone: limpar(corpo.phone, 40),
      email: limpar(corpo.email, 160), cidade: limpar(corpo.city, 120), servico: limpar(corpo.service, 160),
      mensagem: limpar(corpo.message, 2000), lang: limpar(corpo.lang, 8), origem: limpar(corpo.page, 200),
      ip, ua: limpar(req.headers['user-agent'], 200),
    };
    if (!lead.nome || !lead.telefone) return fim(422, { erro: 'nome e telefone obrigatórios' });
    await gravarLead(ARQUIVO, lead);
    console.log('[lead] gravado');
    return fim(204);
  } catch (error) {
    console.error('[lead] falha ao processar:', error.code || error.name);
    if (!res.headersSent) return fim(500, { erro: 'falha ao processar' });
    res.end();
  }
});
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
server.listen(PORT, HOST, () => console.log(`coletor de leads escutando na ${server.address().port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
