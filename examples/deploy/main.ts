import { Bicep } from 'bicep-node';
import path from 'path';
import yargs from 'yargs';
import os from 'os';
import { writeFile } from 'fs/promises';
import { ResourceManagementClient,  } from '@azure/arm-resources';
import { DefaultAzureCredential } from "@azure/identity";

async function main() {
  const args = await yargs
    .strict()
    .option('bicep-binary', { type: 'string', desc: 'Path to the bicep binary', })
    .option('bicep-file', { type: 'string', demandOption: true, desc: 'Path to the bicep file' })
    .option('subscription-id', { type: 'string', demandOption: true, desc: 'Azure subscription id to deploy to' })
    .option('resource-group', { type: 'string', demandOption: true, desc: 'Azure resource group to deploy to' })
    .parseAsync();

  const bicepPath = args.bicepBinary || await Bicep.install(os.tmpdir());
  const bicep = await Bicep.initialize(bicepPath);

  try {
    const bicepFilePath = path.resolve(args.bicepFile);
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

    const client = new ResourceManagementClient(new DefaultAzureCredential(), args.subscriptionId);
    const deploymentResult = await client.deployments.beginCreateOrUpdateAndWait(args.resourceGroup, 'bicep-deploy', {
      properties: {
        mode: 'Incremental',
        template: JSON.parse(result.contents),
      }
    });

    const outputs = deploymentResult.properties?.outputs || {};
    for (const key in outputs) {
      console.log(`Output ${key}: ${(outputs[key] as any).value}`);
    }
  } finally {
    bicep.dispose();
  }
}

main();