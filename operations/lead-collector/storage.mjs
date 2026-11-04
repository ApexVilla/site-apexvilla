import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

/** Restringe a criação de novos dados; não muda permissões de dados existentes. */
export async function gravarLead(arquivo, lead) {
  await mkdir(dirname(arquivo), { recursive: true, mode: 0o700 });
  await appendFile(arquivo, JSON.stringify(lead) + '\n', { encoding: 'utf8', mode: 0o600 });
}
