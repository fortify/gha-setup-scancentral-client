# Setup Fortify ScanCentral Client

Build secure software fast with [Fortify](https://www.microfocus.com/en-us/solutions/application-security). This GitHub Action sets up the Fortify ScanCentral Client to integrate Static Application Security Testing (SAST) into your GitHub workflows. This action:
* Downloads, extracts and caches the specified version of the Fortify ScanCentral Client zip file
* Adds the Fortify ScanCentral Client bin-directory to the path

## Usage

The following example illustrates how to invoke ScanCentral Client from within a GitHub workflow:

```yaml
name: Fortify ScanCentral SAST Scan                     # Name of this workflow
on:
  push:                                                 # Perform Fortify SAST on push and/or pull requests
    branches:
      - master
  pull_request:
    branches:
      - master
jobs:                                                  
  build:
    runs-on: ubuntu-latest                              # Use the appropriate runner for building your source code

    steps:
      - uses: actions/checkout@v2                       # Check out source code
      - uses: actions/setup-java@v1                     # Set up Java (required by ScanCentral Client and for actual build)
        with:
          java-version: 1.8
      - uses: fortify/gha-setup-scancentral-client@v1   # Set up Fortify ScanCentral Client
        with:
          version: 20.1.0                               # Optional as 20.1.0 is the default (and currently only version available)
                                                        # Run Fortify ScanCentral Client. Update based on your build tool, technology 
                                                        # and Fortify ScanCentral details
      - run: scancentral -url ${URL} start -bt mvn -upload -application "My Application" -version "1.0" -uptoken $TOKEN
        env:                                            
          URL: ${{ secrets.SC_URL }}
		  TOKEN: ${{ secrets.SSC_UPLOAD_TOKEN }}
      - uses: actions/upload-artifact@v2                # Archive ScanCentral Client logs on failure
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


## Inputs

### `version`
**Required** The version of the Fortify ScanCentral Client to be set up. Default `20.1.0`.

## Additional Considerations
* In order to utilize the ScanCentral Client for packaging .NET code, you will need to modify the sample workflow to utilize a Windows runner.
* Be sure to consider the appropriate event triggers for your project and branching strategy
* If you are not already a Fortify customer, check out our [Free Trial](https://www.microfocus.com/en-us/products/application-security-testing/free-trial)
