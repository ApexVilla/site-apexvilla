import { BlockList, isIP } from 'node:net';

const familia = (ip) => (isIP(ip) === 6 ? 'ipv6' : 'ipv4');

function lista(entradas) {
  const blocos = new BlockList();
  for (const entrada of entradas) {
    const [ip, bits] = entrada.split('/');
    if (!isIP(ip)) continue;
    if (bits === undefined) blocos.addAddress(ip, familia(ip));
    else if (/^\d+$/.test(bits)) blocos.addSubnet(ip, Number(bits), familia(ip));
  }
  return blocos;
}

// Faixas oficiais cloudflare.com/ips-v4 e /ips-v6, conferidas em 18/10/2026.
const cloudflare = lista([
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
  '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
  '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
  '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
]);

/** Proxies confiáveis a partir de «ip,ip/bits,…» (IP exato ou faixa CIDR). O IP do
 *  Traefik muda quando ele é recriado; por isso vale a faixa da rede Docker dele. */
export function proxiesConfiaveis(texto) {
  return lista(String(texto || '').split(',').map((x) => x.trim()).filter(Boolean));
}

export function clientIp(req, confiaveis) {
  const peer = (req.socket.remoteAddress || '').replace(/^::ffff:/, '');
  if (!isIP(peer) || !confiaveis.check(peer, familia(peer))) return peer || 'desconhecido';
  const xff = req.headers['x-forwarded-for'];
  const last = typeof xff === 'string' ? xff.split(',').pop().trim() : '';
  if (!isIP(last)) return peer;
  const cf = req.headers['cf-connecting-ip'];
  if (cloudflare.check(last, familia(last)) && typeof cf === 'string' && isIP(cf.trim())) return cf.trim();
  return last;
}
