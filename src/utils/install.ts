import os from 'os';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const latestReleaseUrl = 'https://aka.ms/BicepLatestRelease';
const downloadBaseUrl = 'https://downloads.bicep.azure.com';

async function getLatestRelease() {
  const response = await fetch(latestReleaseUrl);
  const body = await response.json() as { 'tag_name': string };

  return body['tag_name'];
}

function getDownloadUrl(osPlat: string, osArch: string, version: string) {
  const basePath = `${downloadBaseUrl}/${version}`;

  switch (`${osPlat}_${osArch}`) {
    case 'win32_x64': return `${basePath}/bicep-win-x64.exe`;
    case 'linux_x64': return `${basePath}/bicep-linux-x64`;
    case 'darwin_x64': return `${basePath}/bicep-osx-x64`;
    case 'darwin_arm64': return `${basePath}/bicep-osx-arm64`;
    default: throw `Bicep CLI is not available for platform ${osPlat} and architecture ${osArch}`;
  }
}

export async function installBicepCli(basePath: string, version?: string) {
  const platform = os.platform();
  const arch = os.arch();

  return installBicepCliWithArch(basePath, platform, arch, version);
}

async function installBicepCliWithArch(basePath: string, platform: string, arch: string, version?: string) {
  if (!version) {
    version = await getLatestRelease();
  }

  const targetFile = platform === 'win32' ? 'bicep.exe' : 'bicep';
  const downloadUrl = getDownloadUrl(platform, arch, version);

  const response = await fetch(downloadUrl);
  const buffer = await response.arrayBuffer();

  const toolPath = `${basePath}/${targetFile}`;
  await fs.writeFile(toolPath, Buffer.from(buffer));
  await fs.chmod(toolPath, 0o755);

  return toolPath;
}