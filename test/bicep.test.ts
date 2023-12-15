import { Bicep } from "../src";
import path from "path";
import os from "os";
import { spawnSync } from 'child_process';
import { getUniqueTmpDir } from "./utils";

let bicep: Bicep;
async function onBeforeAll() {
  const basePath = await getUniqueTmpDir('default');
  const bicepPath = await Bicep.install(basePath);

  bicep = await Bicep.initialize(bicepPath);
}

function onAfterAll() {
  bicep?.dispose();
}

beforeAll(onBeforeAll, 60000);
afterAll(onAfterAll);

describe("Bicep class", () => {
  it('can return the Bicep CLI download URL', async () => {
    const downloadUrl = await Bicep.getDownloadUrl('0.24.24', 'linux','x64');

    expect(downloadUrl).toBe('https://downloads.bicep.azure.com/v0.24.24/bicep-linux-x64');
  }, 60000);

  it('can install bicep', async () => {
    const basePath = await getUniqueTmpDir('installTest');
    const cliPath = await Bicep.install(basePath);

    const cliName = os.platform() === 'win32' ? 'bicep.exe' : 'bicep';
    expect(cliPath).toBe(path.join(basePath, cliName));

    const result = spawnSync(cliPath,['--version'], { encoding: 'utf-8' });
    expect(result.stdout).toContain('Bicep CLI version');
    expect(result.status).toBe(0);
  }, 60000);

  it("should build a bicep file", async () => {
    const result = await bicep.compile({
      path: path.join(__dirname, "samples/good.bicep"),
    });

    expect(result.success).toBeTruthy();
    expect(result.contents?.length).toBeGreaterThan(0);
  });

  it("should return diagnostics if the bicep file has errors", async () => {
    const result = await bicep.compile({
      path: path.join(__dirname, "samples/bad.bicep"),
    });

    expect(result.success).toBeFalsy();
    expect(result.contents).toBeUndefined();
    const error = result.diagnostics.filter(x => x.level === 'Error')[0];
    expect(error.code).toBe('BCP007')
    expect(error.message).toBe('This declaration type is not recognized. Specify a metadata, parameter, variable, resource, or output declaration.');
  });
});