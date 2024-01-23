// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import os from "os";
import {
  MessageConnection,
} from "vscode-jsonrpc/node";
import { getBicepCliDownloadUrl, installBicepCliWithArch } from "./install";
import { CompileParamsRequest, CompileParamsResponse, CompileRequest, CompileResponse, GetDeploymentGraphRequest, GetDeploymentGraphResponse, GetFileReferencesRequest, GetFileReferencesResponse, GetMetadataRequest, GetMetadataResponse, VersionRequest, VersionResponse } from "./types";
import { compileParamsRequestType, compileRequestType, getDeploymentGraphRequestType, getFileReferencesRequestType, getMetadataRequestType, hasMinimumVersion, openConnection, versionRequestType } from "./jsonrpc";

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
    const bicep = new Bicep(connection);

    try {
      const version = await bicep.version();
      const { success, minimumVersion } = hasMinimumVersion(version);
      if (!success) {
        throw new Error(`Bicep CLI version ${version} is not supported. Please install version ${minimumVersion} or later.`);
      }

      return bicep;
    } catch (e) {
      bicep.dispose();
      throw e;
    }
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
   * Gets the version of the Bicep CLI.
   *
   * @returns        The version.
   */
  async version(): Promise<string> {
    const response = await this.connection.sendRequest(versionRequestType, {});

    return response.version;
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
   * Compiles a Bicepparam file.
   *
   * @param request  The compilation request.
   * @returns        The compilation response.
   */
  async compileParams(request: CompileParamsRequest): Promise<CompileParamsResponse> {
    return await this.connection.sendRequest(compileParamsRequestType, request);
  }

  /**
   * Returns metadata for a Bicep file.
   *
   * @param request  The getMetadata request.
   * @returns        The getMetadata response.
   */
  async getMetadata(request: GetMetadataRequest): Promise<GetMetadataResponse> {
    return await this.connection.sendRequest(getMetadataRequestType, request);
  }

  /**
   * Returns the deployment graph for a Bicep file.
   *
   * @param request  The getDeploymentGraph request.
   * @returns        The getDeploymentGraph response.
   */
  async getDeploymentGraph(request: GetDeploymentGraphRequest): Promise<GetDeploymentGraphResponse> {
    return await this.connection.sendRequest(getDeploymentGraphRequestType, request);
  }

  /**
   * Returns file references for a Bicep file.
   *
   * @param request  The getFileReferences request.
   * @returns        The getFileReferences response.
   */
  async getFileReferences(request: GetFileReferencesRequest): Promise<GetFileReferencesResponse> {
    return await this.connection.sendRequest(getFileReferencesRequestType, request);
  }

  /**
   * Disposes of the connection to the Bicep CLI. This MUST be called after usage to avoid leaving the process running.
   */
  dispose() {
    this.connection.dispose();
  }
}