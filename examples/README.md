## Running Examples

### Compile
The following sample will generate a .json template from a .bicep file

```sh
cd examples
npm i
npm run compile -- --bicep-file files/aks.bicep --output-file files/aks.json
```

### Deploy
The following sample will deploy a .bicep file to Azure

```sh
cd examples
npm i
npm run deploy -- --bicep-file files/output.bicep --subscription-id d08e1a72-8180-4ed3-8125-9dff7376b0bd --resource-group blog
```

### Generate a Markdown file
The following sample will generate a .md file from a .bicep file

```sh
cd examples
npm i
npm run markdown -- --bicep-file files/aks.bicep --output-file files/aks.md
```