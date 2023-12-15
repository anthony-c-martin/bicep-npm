// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import os from "os";
import {
  MessageConnection,
} from "vscode-jsonrpc/node";
import { getBicepCliDownloadUrl, installBicepCliWithArch } from "./install";
import { CompileRequest, CompileResponse, ValidateRequest, ValidateResponse } from "./types";
import { compileRequestType, openConnection, validateRequestType } from "./jsonrpc";

/**
 * Helper class to install and interact with the Bicep CLI.
 */
export class Bicep {
  private constructor(private connection: MessageConnection) {}

  /**
   * Initializes the Bicep library with a connection to the Bicep CLI.
   *
   * @param bicepPath  The path to the Bicep CLI. You can point this to an existing install, or use `Bicep.install()` to obtain this path.
   * @returns          A `Bicep` instance.
   */
  static async initialize(bicepPath: string) {
    const connection = await openConnection(bicepPath);
    return new Bicep(connection);
  }

  /**
   * Returns the Bicep CLI download URL.
   *
   * @param version   The version of the Bicep CLI to download. Defaults to the latest version.
   * @param platform  The platform to download for. Defaults to `os.platform()`.
   * @param arch      The architecture to download for. Defaults to `os.arch()`.
   * @returns         The download URL.
   */
  static async getDownloadUrl(
    version?: string,
    platform?: string,
    arch?: string): Promise<string> {

      platform ??= os.platform();
      arch ??= os.arch();

    return await getBicepCliDownloadUrl(platform, arch, version);
  }

  /**
   * Downloads the Bicep CLI to the specified path.
   *
   * @param basePath  The file system path to download the Bicep CLI to. This path must already exist.
   * @param version   The version of the Bicep CLI to download. Defaults to the latest version.
   * @param platform  The platform to download for. Defaults to `os.platform()`.
   * @param arch      The architecture to download for. Defaults to `os.arch()`.
   * @returns         The path to the Bicep CLI.
   */
  static async install(
    basePath: string,
    version?: string,
    platform?: string,
    arch?: string): Promise<string> {

    platform ??= os.platform();
    arch ??= os.arch();

    return await installBicepCliWithArch(basePath, platform, arch, version);
  }

  /**
   * Compiles a Bicep file.
   *
   * @param request  The compilation request.
   * @returns        The compilation response.
   */
  async compile(request: CompileRequest): Promise<CompileResponse> {
    return await this.connection.sendRequest(compileRequestType, request);
  }

  /**
   * Validates a Bicep file against Azure.
   *
   * @param request  The validate request.
   * @returns        The validate response.
   */
  async validate(request: ValidateRequest): Promise<ValidateResponse> {
    return await this.connection.sendRequest(validateRequestType, request);
  }

  /**
   * Disposes of the connection to the Bicep CLI. This MUST be called after usage to avoid leaving the process running.
   */
  dispose() {
    this.connection.dispose();
  }
}