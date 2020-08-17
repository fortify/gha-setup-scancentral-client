import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs-extra';
import * as path from 'path';

const INPUT_VERSION = 'version';
const TOOL_NAME = 'Fortify ScanCentral';
const CLIENT_AUTH_TOKEN = "client-auth-token"
const IS_WINDOWS = process.platform === 'win32';

function getDownloadUrl(version: string): string {
  return 'https://tools.fortify.com/scancentral/Fortify_ScanCentral_Client_' + version + '_x64.zip';
}

async function downloadAndExtract(url: string): Promise<string> {
  core.debug("Downloading " + url);
  const toolZip = await tc.downloadTool(url);
  core.debug("Extracting " + toolZip);
  const extractPath = await tc.extractZip(toolZip);
  return extractPath;
}

async function updateBinPermissions(dir: string): Promise<void> {
  if (!IS_WINDOWS) {
    core.debug("Updating permissions for files in " + dir);
    fs.readdirSync(dir).forEach(file => {
      var filePath = path.join(dir, file);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        core.debug("Changing permissions for " + filePath + " to 0o555");
        fs.chmodSync(filePath, 0o555);
      }
    });
  }
}

async function installAndCache(version: string): Promise<string> {
  const toolRootDir = await downloadAndExtract(getDownloadUrl(version));
  const toolBinDir = path.join(toolRootDir, 'bin');
  await updateBinPermissions(toolBinDir);
  const cachedRootDir = await tc.cacheDir(toolRootDir, TOOL_NAME, version);
  return cachedRootDir;
}

async function getCachedRootDir(version: string): Promise<string> {
  var cachedToolPath = tc.find(TOOL_NAME, version);
  if (!cachedToolPath) {
    cachedToolPath = await installAndCache(version);
    core.info('Successfully installed ' + TOOL_NAME + " version " + version);
  }
  return cachedToolPath;
}

async function addClientProperties(toolDir: string): Promise<void> {
  var clientProperties = `${toolDir}/Core/config/client.properties`
  var clientAuthToken = core.getInput(CLIENT_AUTH_TOKEN);
  await fs.ensureFile(clientProperties);
  if ( clientAuthToken ) {
    fs.writeFile(clientProperties, `client_auth_token=${clientAuthToken}`);
  }
}

async function main(): Promise<void> {
  try {
    core.startGroup('Setup Fortify ScanCentral Client');
    const version = core.getInput(INPUT_VERSION);
    const toolDir = await getCachedRootDir(version);
    await addClientProperties(toolDir);
    const toolBinDir = path.join(toolDir, 'bin');
    core.addPath(toolBinDir);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

main();