const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const fs = require('fs-extra');
const path = require('path');

const TOOL_URL  = 'https://tools.fortify.com/scancentral/Fortify_ScanCentral_Client_20.1.0_x64.zip';
const IS_WINDOWS = process.platform === 'win32';

async function downloadAndExtract(url) {
  const toolZip = await tc.downloadTool(url);
  const extractPath = await tc.extractZip(toolZip);
  return extractPath;
}

async function updateBinPermissions(dir) {
  if ( !IS_WINDOWS ) {
	  fs.readdirSync(dir).forEach(file => {
	  var filePath = path.join(dir, file);
	  var stat = fs.statSync(filePath);
	  if (stat.isFile()) {
	    fs.chmodSync(filePath, 0o555);
	  }
	});
  }
}

async function run() {
  try {
    core.startGroup('Setup Fortify ScanCentral Client');
    const toolRootDir = await downloadAndExtract(TOOL_URL);
    core.info("Tool root dir: "+toolRootDir);
    const toolBinDir = path.join(toolRootDir, 'bin');
    core.info("Tool bin dir: "+toolBinDir);
    await updateBinPermissions(toolBinDir);
    core.info("Adding bin dir to path");
    core.addPath(toolBinDir);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

run();