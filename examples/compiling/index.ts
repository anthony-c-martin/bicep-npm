import { Bicep } from 'bicep-node';
import path from 'path';

async function main() {
  const bicep = await Bicep.initialize('/Users/ant/.azure/bin/bicep');

  const bicepFilePath = path.join(__dirname, 'main.bicep');
  
  const result = await bicep.compile({ 
    path: bicepFilePath,
  });

  console.log(`Result: ${result.contents}`);

  bicep.dispose();
}

main();