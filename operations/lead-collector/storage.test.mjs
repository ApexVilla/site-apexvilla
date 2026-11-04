import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gravarLead } from './storage.mjs';

async function temporario(run) {
  const root = await mkdtemp(join(tmpdir(), 'prj239-storage-'));
  const previous = process.umask(0);
  try { await run(root); }
  finally { process.umask(previous); await rm(root, { recursive: true, force: true }); }
}

test('cria diretórios 0700 e arquivo 0600 mesmo com umask permissiva', async () => {
  await temporario(async root => {
    const arquivo = join(root, 'novo', 'dados', 'registros.jsonl');
    await gravarLead(arquivo, { fixture: 'registro sintético sem dados pessoais' });
    assert.equal((await stat(join(root, 'novo'))).mode & 0o777, 0o700);
    assert.equal((await stat(join(root, 'novo', 'dados'))).mode & 0o777, 0o700);
    assert.equal((await stat(arquivo)).mode & 0o777, 0o600);
  });
});

test('acrescenta JSONL sem perder o registro anterior e preserva Unicode', async () => {
  await temporario(async root => {
    const arquivo = join(root, 'registros.jsonl');
    await gravarLead(arquivo, { fixture: 'primeiro registro' });
    await gravarLead(arquivo, { fixture: 'segundo registro — ação' });
    assert.deepEqual((await readFile(arquivo, 'utf8')).trimEnd().split('\n').map(JSON.parse),
      [{ fixture: 'primeiro registro' }, { fixture: 'segundo registro — ação' }]);
  });
});

test('não muda modo ou conteúdo anterior de arquivo e diretório existentes', async () => {
  await temporario(async root => {
    const diretorio = join(root, 'existente');
    const arquivo = join(diretorio, 'registros.jsonl');
    await mkdir(diretorio, { mode: 0o750 });
    await writeFile(arquivo, '{"fixture":"anterior"}\n');
    await chmod(arquivo, 0o640);
    await gravarLead(arquivo, { fixture: 'novo registro' });
    assert.equal((await stat(diretorio)).mode & 0o777, 0o750);
    assert.equal((await stat(arquivo)).mode & 0o777, 0o640);
    assert.equal(await readFile(arquivo, 'utf8'), '{"fixture":"anterior"}\n{"fixture":"novo registro"}\n');
  });
});
