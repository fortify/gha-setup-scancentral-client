# Setup Fortify ScanCentral Client

Build secure software fast with [Fortify](https://www.microfocus.com/en-us/solutions/application-security). Fortify offers end-to-end application security solutions with the flexibility of testing on-premises and on-demand to scale and cover the entire software development lifecycle.  With Fortify, find security issues early and fix at the speed of DevOps. This GitHub Action sets up the Fortify ScanCentral Client to integrate Static Application Security Testing (SAST) into your GitHub workflows. This action:
* Downloads, extracts and caches the specified version of the Fortify ScanCentral Client zip file
* Adds the Fortify ScanCentral Client bin-directory to the path

## Usage

The following example illustrates how to invoke ScanCentral Client from within a GitHub workflow:

```yaml
name: Fortify ScanCentral SAST Scan                            # Name of this workflow
on:
  workflow_dispatch:
  push:
    branches: [master]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: [master]

jobs:                                                  
  Fortify-SAST:
    # Use the appropriate runner for building your source code
    runs-on: ubuntu-latest                                     

      # Check out source code
      - name: Check Out Source Code
        uses: actions/checkout@v2
        with:
          # Fetch at least the immediate parents so that if this is a pull request then we can checkout the head.
          fetch-depth: 2
      # If this run was triggered by a pull request event, then checkout the head of the pull request instead of the merge commit.
      - run: git checkout HEAD^2
        if: ${{ github.event_name == 'pull_request' }}      
      # Java 8 required by ScanCentral Client
      - name: Setup Java
        uses: actions/setup-java@v1
        with:
          java-version: 1.8

      ### Set up Fortify ScanCentral Client ###
      - name: Download Fortify ScanCentral Client
      - uses: fortify/gha-setup-scancentral-client@v1   
        with:
          version: 20.1.0                                      # Optional as 20.1.0 is the default (and currently only version available)
          client-auth-token: ${{ secrets.CLIENT_AUTH_TOKEN }}  # Optional, but required if ScanCentral Controller requires client authentication

      ### Run Fortify ScanCentral Client ###
      # Update BUILD_OPTS based on the ScanCentral Client documentation and your project's included tech stack(s).
      #   ScanCentral Client will download dependencies for maven, gradle and msbuild projects.
      #   For other build tools, add your build commands to the workflow to download necessary dependencies and prepare according to Fortify SCA documentation.
      - name: Perform SAST Scan
      - run: scancentral -url ${URL} start $BUILD_OPTS -upload -application $APPLICATION -version $VERSION -uptoken $TOKEN
        env:                                            
          URL: ${{ secrets.SSC_URL }}
          TOKEN: ${{ secrets.SSC_UPLOAD_TOKEN }}
          APPLICATION: "My Application"
          VERSION: "1.0"
          BUILD_OPTS: "-bt mvn"

      ### Archive ScanCentral Client logs on failure ###
      - name: Save ScanCentral Logs
      - uses: actions/upload-artifact@v2                
        if: failure()
        with:
           name: scancentral-logs
           path: ~/.fortify/scancentral/log
```

This example workflow demonstrates the use of the `fortify/gha-setup-scancentral-client` action to set up ScanCentral Client, and then invoking ScanCentral Client similar to how you would manually 
run this command from a command line. You can run any available client action like `start` or `package`, and even invoke the other commands shipped with ScanCentral Client like `pwtool`. Please
see the [ScanCentral documentation](https://www.microfocus.com/documentation/fortify-software-security-center/2010/ScanCentral_Help_20.1.0/index.htm#Submit_Job.htm%3FTocPath%3DSubmitting%2520Scan%2520Requests%7C_____0)
for details. All potentially sensitive data should be stored in the GitHub secrets storage.

Following are the most common use cases for this GitHub Action:

* Start a SAST scan on a ScanCentral environment; note that the ScanCentral Controller must be accessible from the 
  GitHub Runner where the workflow is running.
* Start a scan on Fortify on Demand (FoD), utilizing ScanCentral Client for packaging only; see 
  https://github.com/fortify/gha-setup-fod-uploader for details

## Additional Considerations
* In order to utilize the ScanCentral Client for packaging .NET code, you will need to modify the sample workflow to utilize a Windows runner. Windows-based runners use different syntax and different file locations. In particular:
    * Environment variables are referenced as `$Env:var` instead of `$var`, for example `"$Env:URL"` instead of `$URL`
    * ScanCentral logs are stored in a different location, so the upload-artifact step would need to be adjusted accordingly if you wish to archive ScanCentral logs
* Be sure to consider the appropriate event triggers for your project and branching strategy
* If you are not already a Fortify customer, check out our [Free Trial](https://www.microfocus.com/en-us/products/application-security-testing/free-trial)

## Inputs

### `version`
**Required** The version of the Fortify ScanCentral Client to be set up. Default if not specified is `20.1.0`.

### `client-auth-token`
**Optional** Client authentication token to pass to ScanCentral Controller. Required if ScanCentral Controller accepts authorized clients only.

