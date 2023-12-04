import fs from 'fs/promises';
import fetch from 'node-fetch';

const latestReleaseUrl = 'https://aka.ms/BicepLatestRelease';
const downloadBaseUrl = 'https://downloads.bicep.azure.com';

async function getLatestRelease() {
  const response = await fetch(latestReleaseUrl);
  if (!response.ok) {
    throw `Failed to find latest release of Bicep CLI. Status code: ${response.status}`;
  }
  const body = await response.json() as { 'tag_name': string };

  return body['tag_name'];
}

function getDownloadUrl(osPlat: string, osArch: string, tagName: string) {
  const basePath = `${downloadBaseUrl}/${tagName}`;

  switch (`${osPlat}_${osArch}`.toLowerCase()) {
    case 'win32_x64': return `${basePath}/bicep-win-x64.exe`;
    case 'win32_arm64': return `${basePath}/bicep-win-arm64.exe`;
    case 'linux_x64': return `${basePath}/bicep-linux-x64`;
    case 'linux_arm64': return `${basePath}/bicep-linux-arm64`;
    case 'darwin_x64': return `${basePath}/bicep-osx-x64`;
    case 'darwin_arm64': return `${basePath}/bicep-osx-arm64`;
    default: throw `Bicep CLI is not available for platform ${osPlat} and architecture ${osArch}`;
  }
}

export async function installBicepCliWithArch(basePath: string, platform: string, arch: string, version?: string) {
  const tagName = version ? `v${version}` : await getLatestRelease();
  
  const targetFile = platform === 'win32' ? 'bicep.exe' : 'bicep';
  const downloadUrl = getDownloadUrl(platform, arch, tagName);

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw `Failed to download Bicep CLI. Status code: ${response.status}`;
  }
  const buffer = await response.arrayBuffer();

  const toolPath = `${basePath}/${targetFile}`;
  await fs.writeFile(toolPath, Buffer.from(buffer));
  await fs.chmod(toolPath, 0o755);

  return toolPath;
}