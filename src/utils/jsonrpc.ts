// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from "path";
import os from "os";
import { spawn, spawnSync, ChildProcess } from "child_process";
import { randomBytes } from "crypto";
import { createServer } from "net";
import {
  RequestType,
  createMessageConnection,
  MessageReader,
  MessageWriter,
  SocketMessageReader,
  SocketMessageWriter,
} from "vscode-jsonrpc/node";
import { CompileRequest, CompileResponse, ValidateRequest, ValidateResponse } from "./types";
  
export const compileRequestType = new RequestType<
  CompileRequest,
  CompileResponse,
  never
>("bicep/compile");

export const validateRequestType = new RequestType<
  ValidateRequest,
  ValidateResponse,
  never
>("bicep/validate");

function tryGetVersionNumberError(bicepPath: string) {
  const result = spawnSync(bicepPath, ["--version"], { encoding: "utf-8" });
  if (result.status !== 0) {
    return `Failed to obtain valid Bicep version from '${bicepPath} --version'`;
  }

  const versionMatch = result.stdout.match(/Bicep CLI version ([^ ]+) /);
  if (!versionMatch) {
    return `Failed to obtain valid Bicep version from '${bicepPath} --version'`;
  }

  const minimumVersion = '0.24.24';
  const actualVersion = versionMatch[1];
  const compareResult = actualVersion.localeCompare(minimumVersion, undefined, { numeric: true, sensitivity: 'base' });
  if (compareResult < 0) {
    return `A minimum Bicep version of ${minimumVersion} is required. Detected version ${actualVersion} from '${bicepPath} --version'`;
  }
  
  return;
}

function generateRandomPipeName(): string {
  const randomSuffix = randomBytes(21).toString("hex");
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\bicep-${randomSuffix}-sock`;
  }

  return path.join(os.tmpdir(), `bicep-${randomSuffix}.sock`);
}

function connectClientPipe(pipeName: string, process: ChildProcess): Promise<[MessageReader, MessageWriter]> {
  return new Promise<[MessageReader, MessageWriter]>((resolve, reject) => {
    const onProcessExit = () => {
      server.close();
      reject();
    };

		const server = createServer(socket => {
      process.removeListener('exit', onProcessExit)
			server.close();
      resolve([
				new SocketMessageReader(socket, 'utf-8'),
				new SocketMessageWriter(socket, 'utf-8')
      ]);
		});

    process.on('exit', onProcessExit);
		server.on('error', reject);
		server.listen(pipeName, () => server.removeListener('error', reject));
  });
}

export async function openConnection(bicepPath: string) {
  const pipePath = generateRandomPipeName();

  const process = spawn(bicepPath, ["jsonrpc", "--pipe", pipePath]);
  let stderr = '';
  process.stderr.on("data", (x) => stderr += x.toString());
  const processExitedEarly = new Promise<void>((_, reject) => 
    process.on("exit", () => {
      const error = tryGetVersionNumberError(bicepPath);
      if (error) {
        reject(error);
      } else {
        reject(`Failed to invoke '${bicepPath} jsonrpc'. Error: ${stderr}`);
      }
    }));

  const transportConnected = connectClientPipe(pipePath, process);

  const result = await Promise.race([
    transportConnected,
    processExitedEarly,
  ]);

  const [reader, writer] = result!;
  const connection = createMessageConnection(reader, writer, console);
  connection.onDispose(() => process.kill());
  process.on("exit", () => connection.dispose());

  connection.listen();
  return connection;
}