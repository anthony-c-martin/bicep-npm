import { Bicep } from 'bicep-node';
import path from 'path';
import yargs from 'yargs';
import os from 'os';
import { writeFile } from 'fs/promises';

async function main() {
  const args = await yargs
    .strict()
    .option('bicep-binary', { type: 'string', desc: 'Path to the bicep binary', })
    .option('bicep-file', { type: 'string', demandOption: true, desc: 'Path to the bicep file' })
    .option('output-file', { type: 'string', desc: 'Path to write the template file to' })
    .parseAsync();
    
  const bicepFilePath = path.resolve(args.bicepFile);
  const jsonFilePath = args.outputFile ? path.resolve(args.outputFile) : bicepFilePath.replace(/\.bicep$/, '.json');

  const bicepPath = args.bicepBinary || await Bicep.install(os.tmpdir());
  const bicep = await Bicep.initialize(bicepPath);

  try {
    const result = await bicep.compile({
      path: bicepFilePath,
    });
  
    for (const diag of result.diagnostics) {
      const message = `[${diag.level}] ${diag.code} ${diag.message}`;
      console.error(message);
    }

    if (!result.contents) {
      throw 'Compilation failed';
    }
  
    if (result.contents) {
      await writeFile(jsonFilePath, result.contents, 'utf-8')
    }
  } finally {
    bicep.dispose();
  }
}

main();