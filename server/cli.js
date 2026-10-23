'use strict';

/**
 * CLI: extrai o código de um formulário sem passar pelo Chrome.
 *
 *   node cli.js "C:\projeto\form.scx"
 *   node cli.js form.scx --mode=scctext -o form.txt
 *   node cli.js form.scx --mode=foxbin2prg -o form.sc2
 *   node cli.js --rebuild form.sc2 --scx form.scx -o saida\
 */

const fs = require('fs');
const path = require('path');
const { extract, rebuild } = require('./core');
const { loadConfig } = require('./config');

function usage() {
  console.log(
    [
      'Uso:',
      '  node cli.js <arquivo.scx> [--mode=classbrowser|scctext|foxbin2prg] [-o saida]',
      '  node cli.js --rebuild <arquivo.sc2> --scx <original.scx> [--sct <original.sct>] [-o pasta]',
      '',
      '  --mode       classbrowser (padrão), scctext (dump completo) ou',
      '               foxbin2prg (texto .sc2 recompilável)',
      '  --preamble   mantém o preâmbulo executável (PUBLIC/NEWOBJECT/Show)',
      '  -o           arquivo de saída (extração) ou pasta/arquivo base (recompilação)',
      '',
      'Recompilação: gera <nome>.recompilado.scx, <nome>.recompilado.sct e',
      '<nome>.recompilado.zip; nunca sobrescreve os originais.',
      '',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const args = {
    file: null,
    mode: null,
    out: null,
    preamble: false,
    rebuild: false,
    scx: null,
    sct: null,
  };
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
    } else if (arg === '--rebuild') {
      args.rebuild = true;
    } else if (arg.startsWith('--scx=')) {
      args.scx = arg.slice('--scx='.length);
    } else if (arg === '--scx') {
      args.scx = argv[++i];
    } else if (arg.startsWith('--sct=')) {
      args.sct = arg.slice('--sct='.length);
    } else if (arg === '--sct') {
      args.sct = argv[++i];
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

function siblingMemo(file) {
  return path.join(
    path.dirname(file),
    `${path.basename(file, path.extname(file))}.sct`,
  );
}

function stem(file) {
  return path.basename(file, path.extname(file));
}

function readTextAuto(file) {
  const buffer = fs.readFileSync(file);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

async function runExtract(args) {
  const scxPath = path.resolve(args.file);
  if (!fs.existsSync(scxPath)) {
    console.error(`Arquivo não encontrado: ${scxPath}`);
    process.exit(2);
  }

  const sctPath = siblingMemo(scxPath);
  const mode = args.mode || loadConfig().defaultMode;
  const outPath =
    args.out ||
    path.join(
      path.dirname(scxPath),
      mode === 'foxbin2prg'
        ? `${stem(scxPath)}.sc2`
        : `${stem(scxPath)}.${mode}.txt`,
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

async function runRebuild(args) {
  if (!args.scx) {
    console.error('Informe o .scx original com --scx.');
    usage();
    process.exit(2);
  }

  const sc2Path = path.resolve(args.file);
  const scxPath = path.resolve(args.scx);
  const sctPath = path.resolve(args.sct || siblingMemo(scxPath));
  if (!fs.existsSync(sc2Path)) {
    console.error(`Arquivo .sc2 não encontrado: ${sc2Path}`);
    process.exit(2);
  }
  if (!fs.existsSync(scxPath)) {
    console.error(`Arquivo .scx não encontrado: ${scxPath}`);
    process.exit(2);
  }
  if (!fs.existsSync(sctPath)) {
    console.error(`Arquivo .sct não encontrado: ${sctPath}`);
    process.exit(2);
  }

  const outBase = args.out
    ? path.resolve(args.out)
    : path.join(path.dirname(sc2Path), `${stem(sc2Path)}.recompilado`);
  const isDir =
    args.out &&
    (fs.existsSync(outBase)
      ? fs.statSync(outBase).isDirectory()
      : /[\\/]$/.test(args.out) || path.extname(outBase) === '');
  if (isDir) {
    fs.mkdirSync(outBase, { recursive: true });
  }
  const target = isDir
    ? path.join(outBase, `${stem(sc2Path)}.recompilado`)
    : outBase.replace(/\.(scx|sct|zip)$/i, '');

  console.log(`Texto   : ${sc2Path}`);
  console.log(`Original: ${scxPath}`);
  console.log(`Memo    : ${sctPath}`);
  console.log(`Saída   : ${target}.scx + ${target}.sct`);

  try {
    const result = await rebuild({
      fileName: path.basename(scxPath),
      scx: fs.readFileSync(scxPath),
      sct: fs.readFileSync(sctPath),
      text: readTextAuto(sc2Path),
    });

    fs.writeFileSync(`${target}.scx`, Buffer.from(result.scx, 'base64'));
    fs.writeFileSync(`${target}.sct`, Buffer.from(result.sct, 'base64'));
    fs.writeFileSync(`${target}.zip`, Buffer.from(result.zip, 'base64'));

    const v = result.verification || {};
    console.log('');
    console.log(`OK: ${result.stats.records} registro(s), ${result.stats.fields} campo(s)`);
    console.log(
      `Verificação: ${
        v.checked
          ? v.identical
            ? 'texto reexportado idêntico'
            : `${v.added} linha(s) adicionada(s) / ${v.removed} removida(s)`
          : v.warning || 'não executada'
      }`,
    );
    if (v.sample && v.sample.length) {
      console.log('Amostra das diferenças:');
      for (const line of v.sample) console.log(`  ${line}`);
    }
    console.log(`Arquivos: ${target}.scx, ${target}.sct, ${target}.zip`);
  } catch (err) {
    console.error('');
    console.error(`ERRO: ${err.message}`);
    if (err.details && process.env.FOX2TXT_DEBUG === '1') {
      console.error(JSON.stringify(err.details, null, 2));
    }
    process.exit(1);
  }
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

  if (args.rebuild) {
    await runRebuild(args);
  } else {
    await runExtract(args);
  }
}

main();
