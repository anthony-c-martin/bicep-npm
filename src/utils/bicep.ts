// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import os from "os";
import {
  MessageConnection,
} from "vscode-jsonrpc/node";
import { installBicepCliWithArch } from "./install";
import { CompileRequest, CompileResponse, ValidateRequest, ValidateResponse } from "./types";
import { compileRequestType, openConnection, validateRequestType } from "./jsonrpc";

export class Bicep {
  private constructor(private connection: MessageConnection) {}

  static async initialize(bicepPath: string) {
    const connection = await openConnection(bicepPath);
    return new Bicep(connection);
  }

  static async install(basePath: string, version?: string) {
    const platform = os.platform();
    const arch = os.arch();

    return installBicepCliWithArch(basePath, platform, arch, version);
  }

  async compile(request: CompileRequest): Promise<CompileResponse> {
    return await this.connection.sendRequest(compileRequestType, request);
  }

  async validate(request: ValidateRequest): Promise<ValidateResponse> {
    return await this.connection.sendRequest(validateRequestType, request);
  }

  dispose() {
    this.connection.dispose();
  }
}