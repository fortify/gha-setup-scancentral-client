const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const fs = require('fs-extra');
const path = require('path');

const INPUT_VERSION = 'version';
const TOOL_NAME = 'Fortify ScanCentral';
const IS_WINDOWS = process.platform === 'win32';

function getDownloadUrl(version) {
	return 'https://tools.fortify.com/scancentral/Fortify_ScanCentral_Client_'+version+'_x64.zip';
}

async function downloadAndExtract(url) {
  core.debug("Downloading "+url);
  const toolZip = await tc.downloadTool(url);
  core.debug("Extracting "+toolZip);
  const extractPath = await tc.extractZip(toolZip);
  return extractPath;
}

async function updateBinPermissions(dir) {
  if ( !IS_WINDOWS ) {
	  core.debug("Updating permissions for files in "+dir);
	  fs.readdirSync(dir).forEach(file => {
	  var filePath = path.join(dir, file);
	  var stat = fs.statSync(filePath);
	  if (stat.isFile()) {
		core.debug("Changing permissions for "+filePath+" to 0o555");
	    fs.chmodSync(filePath, 0o555);
	  }
	});
  }
}

async function installAndCache(version) {
  const toolRootDir = await downloadAndExtract(getDownloadUrl(version));
  const toolBinDir = path.join(toolRootDir, 'bin');
  await updateBinPermissions(toolBinDir);
  const cachedRootDir = await tc.cacheDir(toolRootDir, TOOL_NAME, version);
  return cachedRootDir;
}

async function getCachedRootDir(version) {
  var cachedToolPath = toolCache.find(TOOL_NAME, version);
  if (!cachedToolPath) {
    cachedToolPath = await installAndCache(version);
    core.info('Successfully installed '+TOOL_NAME+" version "+version);
  }
  return cachedToolPath;
}

async function run() {
  try {
	const version = core.getInput(INPUT_VERSION);
	const toolDir = await getCachedRootDir(version);
    const toolBinDir = path.join(toolDir, 'bin');
    core.addPath(toolBinDir);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

run();