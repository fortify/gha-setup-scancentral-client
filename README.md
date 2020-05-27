# Setup Fortify ScanCentral Client

This GitHub Action sets up the Fortify ScanCentral Client for use in your GitHub workflows:
* Downloads, extracts and caches the specified version of the Fortify CloudScan Client zip file
* Adds the Fortify CloudScan Client bin-directory to the path

## Inputs

### `version`

**Required** The version of the Fortify CloudScan Client to be set up. Default `20.1.0`.

## Usage

```yaml
steps:
- uses: actions/checkout@v2   # Check out source code
- uses: actions/setup-java@v1 # Set up Java (required by ScanCentral Client and for actual build)
  with:
    java-version: 1.8
- uses: fortify-actions/setup-scancentral-client@v1 # Set up Fortify ScanCentral Client
  with:
    version: 20.1.0
- run: scancentral package -bt mvn -o sample.zip # Run Fortify ScanCentral Client
```

As can be seen in this example, the ScanCentral Client can simply be invoked using the `run` directive just like you would run the client from the command line or from a script. You can run any available client action, and even invoke the other commands shipped with CloudScan Client like `pwtool`.
