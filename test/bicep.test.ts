import { Bicep } from "../src";
import path from "path";
import os from 'os';
import { spawnSync } from 'child_process';

let bicep: Bicep;
async function onBeforeAll() {
  let bicepPath = process.env['BICEP_CLI_PATH'];

  if (!bicepPath) {
    const basePath = os.tmpdir();
    bicepPath = await Bicep.install(basePath);
  }

  bicep = await Bicep.initialize(bicepPath);
}

function onAfterAll() {
  bicep?.dispose();
}

beforeAll(onBeforeAll, 60000);
afterAll(onAfterAll);

describe("Bicep class", () => {
  it('can install bicep', async () => {
    const basePath = os.tmpdir();
    const cliPath = await Bicep.install(basePath);
    expect(cliPath).toBe(`${basePath}/bicep`);

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