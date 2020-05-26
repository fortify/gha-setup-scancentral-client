const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const fs = require('fs-extra');
const path = require('path');

const INPUT_VERSION = 'version';
const IS_WINDOWS = process.platform === 'win32';

function getDownloadUrl() {
	var version = core.getInput(INPUT_VERSION);
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
		core.debug("Changing permissions for "+toolRootDir+" to 0o555");
	    fs.chmodSync(filePath, 0o555);
	  }
	});
  }
}

async function run() {
  try {
    core.startGroup('Setup Fortify ScanCentral Client');
    const toolRootDir = await downloadAndExtract(getDownloadUrl());
    const toolBinDir = path.join(toolRootDir, 'bin');
    await updateBinPermissions(toolBinDir);
    core.addPath(toolBinDir);
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    core.endGroup();
  }
}

run();