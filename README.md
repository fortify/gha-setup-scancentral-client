# Setup Fortify ScanCentral Client

This GitHub Action sets up the Fortify ScanCentral Client for use in your GitHub workflows:
* Downloads, extracts and caches the specified version of the Fortify CloudScan Client zip file
* Adds the Fortify CloudScan Client bin-directory to the path

## Usage

```yaml
steps:
- uses: actions/checkout@v2                         # Check out source code
- uses: actions/setup-java@v1                       # Set up Java (required by ScanCentral Client and for actual build)
  with:
    java-version: 1.8
- uses: fortify/gha-setup-scancentral-client@v1 # Set up Fortify ScanCentral Client
  with:
    version: 20.1.0                                 # Optional as 20.1.0 is the default (and currently only version available)
- run: scancentral package -bt mvn -o sample.zip    # Run Fortify ScanCentral Client
- uses: actions/upload-artifact@v2                  # Archive ScanCentral Client logs on failure
  if: failure()
  with:
    name: scancentral-logs
    path: ~/.fortify/scancentral/log
```

As can be seen in this example, the ScanCentral Client can simply be invoked using the `run` directive just like you would run the client from the command line or from a script. You can run any available client action, and even invoke the other commands shipped with CloudScan Client like `pwtool`. The following sections describe the main use cases.

### Submit scan requests to Fortify ScanCentral

In this scenario, you would simply use the ScanCentral Client as described in its documentation, for example using a workflow as follows:

```yaml
steps:
- uses: actions/checkout@v2
- uses: actions/setup-java@v1
  with:
    java-version: 1.8
- uses: fortify/gha-setup-scancentral-client@v1
- run: scancentral -url http://scancentral:8080/sc-ctrl start -bt mvn -upload -application "My Application" -version "1.0" -uptoken 00000000-0000-0000-0000-0000000
- uses: actions/upload-artifact@v2
  if: failure()
  with:
    name: scancentral-logs
    path: ~/.fortify/scancentral/log
```

Obviously, the ScanCentral Controller must be accessible from the GitHub Runner used to run this workflow.

### Submit scan requests to Fortify on Demand

In this scenario, you would use the ScanCentral Client to package the source code and dependencies into a zip file, which can then be uploaded to Fortify on Demand using FoD Uploader. This can be accomplished by adding the [gha-setup-fod-uploader](https://github.com/fortify/gha-setup-fod-uploader) action to the workflow, resulting in a workflow like the following:

```yaml
steps:
- uses: actions/checkout@v2
- uses: actions/setup-java@v1
  with:
    java-version: 1.8
- uses: fortify/gha-setup-scancentral-client@v1
- uses: fortify/gha-setup-fod-uploader@v1
- run: scancentral package -bt mvn -o package.zip
- run: java -jar $FOD_UPLOAD_JAR -bsi "$FOD_BSI" -z package.zip -uc "$FOD_USER" "$FOD_PWD" -ep 2 -pp 1
  env:
    FOD_BSI: ${{ secrets.FOD_BSI }}
    FOD_USER: ${{ secrets.FOD_USER }}
    FOD_PWD: ${{ secrets.FOD_PWD }}
- uses: actions/upload-artifact@v2
  if: failure()
  with:
    name: scancentral-logs
    path: ~/.fortify/scancentral/log
```

In this example, ScanCentral Client is used to package the source code into the sample.zip file, and this same zip file is then uploaded to FoD by invoking FoD Uploader.

## Inputs

### `version`
**Required** The version of the Fortify CloudScan Client to be set up. Default `20.1.0`.
