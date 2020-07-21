# Setup Fortify ScanCentral Client

This GitHub Action sets up the Fortify ScanCentral Client for use in your GitHub workflows:
* Downloads, extracts and caches the specified version of the Fortify ScanCentral Client zip file
* Adds the Fortify ScanCentral Client bin-directory to the path

## Usage

The following example GitHub workflow illustrates how to invoke ScanCentral Client from within a GitHub
workflow:

```yaml
name: Start FoD scan                                    # Name of this workflow
on: [workflow_dispatch]                                 # Triggers for this workflow; we choose to invoke manually
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
		# Run Fortify ScanCentral Client
      - run: scancentral -url http://scancentral:8080/sc-ctrl start -bt mvn -upload -application "My Application" -version "1.0" -uptoken 00000000-0000-0000-0000-0000000
      - uses: actions/upload-artifact@v2                # Archive ScanCentral Client logs on failure
        if: failure()
        with:
           name: scancentral-logs
           path: ~/.fortify/scancentral/log
```

As can be seen in this example, the ScanCentral Client can simply be invoked using the `run` directive just like 
you would run the client from the command line or from a script. You can run any available client action like 
`start` or `package`, and even invoke the other commands shipped with ScanCentral Client like `pwtool`. Please the 
the ScanCentral documentation for more information.

Following are the most common use cases for this GitHub Action:

* Start a scan on a ScanCentral environment; note that the ScanCentral Controller must be accessible from the 
  GitHub Runner where the workflow is running.
* Start a scan on Fortify on Demand (FoD), utilizing ScanCentral Client for packaging only; see 
  https://github.com/fortify/gha-setup-fod-uploader for details


## Inputs

### `version`
**Required** The version of the Fortify ScanCentral Client to be set up. Default `20.1.0`.
