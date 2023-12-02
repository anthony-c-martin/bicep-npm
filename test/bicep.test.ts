import { MessageConnection } from "vscode-jsonrpc";
import { compileRequestType, openConnection, validateRequestType } from "../src/utils/bicep";
import path from "path";

const bicepPath = process.env['BICEP_CLI_PATH'];
if (!bicepPath) {
  throw 'BICEP_CLI_PATH env var is not set';
}

let connection: MessageConnection;
beforeAll(async () => (connection = await openConnection(bicepPath)));
afterAll(() => connection.dispose());

describe("bicep jsonrpc", () => {
  it("should build a bicep file", async () => {
    const result = await compile(
      connection,
      path.join(__dirname, "samples/good.bicep"),
    );

    console.log(bicepPath);

    expect(result.success).toBeTruthy();
    expect(result.contents?.length).toBeGreaterThan(0);
  });

  it("should return diagnostics if the bicep file has errors", async () => {
    const result = await compile(
      connection,
      path.join(__dirname, "samples/bad.bicep"),
    );

    expect(result.success).toBeFalsy();
    expect(result.contents).toBeUndefined();
    const error = result.diagnostics.filter(x => x.level === 'Error')[0];
    expect(error.code).toBe('BCP007')
    expect(error.message).toBe('This declaration type is not recognized. Specify a metadata, parameter, variable, resource, or output declaration.');
  });
});

async function compile(connection: MessageConnection, bicepFile: string) {
  return await connection.sendRequest(compileRequestType, {
    path: bicepFile,
  });
}

async function validate(connection: MessageConnection, bicepparamFile: string) {
  return await connection.sendRequest(validateRequestType, {
    subscriptionId: 'a1bfa635-f2bf-42f1-86b5-848c674fc321',
    resourceGroup: 'ant-test',
    path: bicepparamFile,
  });
}