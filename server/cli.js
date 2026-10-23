'use strict';

/**
 * CLI: extrai o código de um formulário sem passar pelo Chrome.
 *
 *   node cli.js "C:\projeto\form.scx"
 *   node cli.js form.scx --mode=scctext -o form.txt
 */

const fs = require('fs');
const path = require('path');
const { extract } = require('./core');
const { loadConfig } = require('./config');

function usage() {
  console.log(
    [
      'Uso: node cli.js <arquivo.scx> [--mode=classbrowser|scctext] [-o saida.txt]',
      '',
      '  --mode      classbrowser (padrão, gera DEFINE CLASS) ou scctext (dump completo)',
      '  --preamble  mantém o preâmbulo executável (PUBLIC/NEWOBJECT/Show)',
      '  -o          arquivo de saída (padrão: <nome>.<modo>.txt)',
      '',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = { file: null, mode: null, out: null, preamble: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else if (arg.startsWith('--mode=')) {
      args.mode = arg.slice('--mode='.length);
    } else if (arg === '--mode') {
      args.mode = argv[++i];
    } else if (arg === '--preamble') {
      args.preamble = true;
    } else if (arg === '-o' || arg === '--out') {
      args.out = argv[++i];
    } else if (!arg.startsWith('-') && !args.file) {
      args.file = arg;
    } else {
      throw new Error(`Argumento desconhecido: ${arg}`);
    }
  }
  return args;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    usage();
    process.exit(2);
  }

  if (!args.file) {
    usage();
    process.exit(2);
  }

  const scxPath = path.resolve(args.file);
  if (!fs.existsSync(scxPath)) {
    console.error(`Arquivo não encontrado: ${scxPath}`);
    process.exit(2);
  }

  const sctPath = path.join(
    path.dirname(scxPath),
    `${path.basename(scxPath, path.extname(scxPath))}.sct`,
  );

  const mode = args.mode || loadConfig().defaultMode;
  const outPath =
    args.out ||
    path.join(
      path.dirname(scxPath),
      `${path.basename(scxPath, path.extname(scxPath))}.${mode}.txt`,
    );

  console.log(`Lendo   : ${scxPath}`);
  if (fs.existsSync(sctPath)) console.log(`Memo    : ${sctPath}`);
  console.log(`Modo    : ${mode}`);

  try {
    const result = await extract({
      fileName: path.basename(scxPath),
      scx: fs.readFileSync(scxPath),
      sct: fs.existsSync(sctPath) ? fs.readFileSync(sctPath) : null,
      mode,
      includePreamble: args.preamble,
    });

    fs.writeFileSync(outPath, result.text, 'utf8');
    console.log('');
    console.log(`Saída   : ${outPath}`);
    console.log(
      `Resultado: ${result.stats.bytes} bytes, ${result.stats.lines} linhas, ${result.stats.totalMs} ms`,
    );
  } catch (err) {
    console.error('');
    console.error(`ERRO: ${err.message}`);
    if (err.details && process.env.FOX2TXT_DEBUG === '1') {
      console.error(JSON.stringify(err.details, null, 2));
    }
    process.exit(1);
  }
}

main();
