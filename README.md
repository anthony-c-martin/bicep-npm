# bicep-node
Node wrapper to expose functionality for programatically interacting with Bicep files.

[![npm version](https://badge.fury.io/js/bicep-node.svg)](https://badge.fury.io/js/bicep-node)

## Usage

### Importing
Install this package, and add the following:
```typescript
import { Bicep } from 'bicep-node';
```

### Installing Bicep CLI
Install the Bicep CLI to a temporary folder. `bicepPath` will be set to the location of the Bicep CLI. This will install the current latest version of Bicep.
```typescript
const parentPath = os.tmpdir();
const bicepPath = await Bicep.install(parentPath);
```

Install a particular version of the Bicep CLI.
```typescript
const bicepPath = await Bicep.install(parentPath, '0.24.24');
```

### Using the Bicep CLI
Compiling a Bicep file.
```typescript
const bicep = await Bicep.initialize(bicepPath);

const bicepFile = '/path/to/main.bicep'
const result = await bicep.compile({ 
  path: bicepFile,
});
```

Closing the connection to Bicep CLI after usage.
```typescript
bicep.dispose();
```

## Examples
See [Examples](https://github.com/anthony-c-martin/bicep-node/tree/main/examples/README.md) for some example usages.