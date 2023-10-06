<p align="center">
	<img src="doc/logo.png">
</p>
<p align="center">
A <a href="https://www.sonarqube.org/" target="_blank">SonarQube</a> XML reporter for <a href="https://www.cypress.io/" target="_blank">Cypress</a>.
</p>
<p align="center">
Generated XML reports are compliant with <i>Generic Execution</i> described in <a href="https://docs.sonarqube.org/latest/analysis/generic-test/#header-2" target="_blank">https://docs.sonarqube.org/latest/analysis/generic-test/</a>
</p>
<p align="center">
	<a href="https://github.com/BBE78/cypress-sonarqube-reporter/actions/workflows/ci.yml"><img src="https://github.com/BBE78/cypress-sonarqube-reporter/actions/workflows/ci.yml/badge.svg"></a>
	<a href="https://app.fossa.com/projects/git%2Bgithub.com%2FBBE78%2Fcypress-sonarqube-reporter?ref=badge_shield"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FBBE78%2Fcypress-sonarqube-reporter.svg?type=shield"></a>
	<a href="https://www.codacy.com/manual/benoit_2/cypress-sonarqube-reporter?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=BBE78/cypress-sonarqube-reporter&amp;utm_campaign=Badge_Grade"><img src="https://api.codacy.com/project/badge/Grade/b72fd9184ead4b93801c213667e6db17"/></a>
	<a href="https://www.codacy.com/manual/benoit_2/cypress-sonarqube-reporter?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=BBE78/cypress-sonarqube-reporter&amp;utm_campaign=Badge_Coverage"><img src="https://api.codacy.com/project/badge/Coverage/b72fd9184ead4b93801c213667e6db17"/></a>
	<br/>
	<a href="https://cypress.io"><img src="https://img.shields.io/badge/cypress.io-tests-green.svg" alt="cypress.io"></a>
	<a href="https://github.com/BBE78/cypress-sonarqube-reporter/issues"><img src="https://img.shields.io/github/issues-raw/BBE78/cypress-sonarqube-reporter" alt="issues"></a>
	<a href="https://www.npmjs.com/package/cypress-sonarqube-reporter"><img src="https://img.shields.io/npm/dm/cypress-sonarqube-reporter" alt="npmjs"></a>
	<a href="https://www.npmjs.com/package/cypress-sonarqube-reporter"><img src="https://img.shields.io/github/package-json/v/BBE78/cypress-sonarqube-reporter"  alt="GitHub package.json version"></a>
</p>
<br/>

## Why another one?

Since this Cypress issue: <https://github.com/cypress-io/cypress/issues/1495>, spec filename are not available for reporters in a Cypress environnement.

\[**EDIT** 02-14-2020]: despite the correction of this issue since Cypress v3.8.3 (see [Release Notes](https://github.com/cypress-io/cypress/releases/tag/v3.8.3)), the problem is still there and the below reporters are still not working...

So this reporter provides a workaround (simplified as possible) in order to be able to generate these SonarQube reports.

A SonarQube test execution report is created for each Cypress spec file.

Other existing Mocha SonarQube reporters:
*   [danmasta/mocha-sonar](https://github.com/danmasta/mocha-sonar)
*   [mmouterde/mocha-sonarqube-reporter](https://github.com/mmouterde/mocha-sonarqube-reporter)

## Tested with Cypress

Take a look at the Actions tests matrix results: tested with Node.js v\[~~12.x~~, ~~14.x~~, 16.x, 18.x, 20.x] and Cypress v\[4.x, 5.x, 6.x, 7.x, 8.x, 9.x, 10.x, 11.x, 12.x, 13.x]

[![Cypress Compatibility](https://github.com/BBE78/cypress-sonarqube-reporter/actions/workflows/ci.yml/badge.svg)](https://github.com/BBE78/cypress-sonarqube-reporter/actions/workflows/ci.yml)

## Example

The following Cypress/Mocha spec...
```js
describe("The root suite", () => {
    it("Test case #1 (must pass)", () => {
        expect(true).to.be.true;
    });
    describe("A sub suite", () => {
        it("Test case #2 (must pass)", () => {
            expect(true).to.be.true;
        });
        it("Test case #3 (must fail)", () => {
            expect(true).to.be.false;
        });
    });
    describe("Another sub suite", () => {
        xit("Test case #4 (must be skipped)", () => {
            expect(true).to.be.false;
        });
        it("Test case #5 (must raise an error)", () => {
            undefined.toString();
        });
    });
});
```
...will provide the following generated SonarQube report (with default options)
```xml
<!-- File: dist/cypress/integration/Sample.spec.js.xml -->
<?xml version="1.0" encoding="utf-8"?>
<testExecutions version="1">
  <file path="test/cypress/integration/Sample.spec.js">
    <testCase name="The root suite - Test case #1 (must pass)" duration="64"/>
    <testCase name="The root suite - A sub suite - Test case #2 (must pass)" duration="34"/>
    <testCase name="The root suite - A sub suite - Test case #3 (must fail)" duration="513">
      <failure message="AssertionError: expected true to be false">
        <![CDATA[AssertionError: expected true to be false
    at Context.runnable.fn (http://localhost:62294/__cypress/runner/cypress_runner.js:101081:20)
    at callFn (http://localhost:62294/__cypress/runner/cypress_runner.js:30931:21)
    at http://localhost:62294/__cypress/runner/cypress_runner.js:104009:28
    at PassThroughHandlerContext.finallyHandler (http://localhost:62294/__cypress/runner/cypress_runner.js:135962:23)
    at PassThroughHandlerContext.tryCatcher (http://localhost:62294/__cypress/runner/cypress_runner.js:139407:23)
    at Promise._settlePromiseFromHandler (http://localhost:62294/__cypress/runner/cypress_runner.js:137343:31)
    at Promise._settlePromise (http://localhost:62294/__cypress/runner/cypress_runner.js:137400:18)
    at Promise._settlePromise0 (http://localhost:62294/__cypress/runner/cypress_runner.js:137445:10)
    at Promise._settlePromises (http://localhost:62294/__cypress/runner/cypress_runner.js:137524:18)
    at Promise._fulfill (http://localhost:62294/__cypress/runner/cypress_runner.js:137469:18)
    at Promise._settlePromise (http://localhost:62294/__cypress/runner/cypress_runner.js:137413:21)
    at Promise._settlePromise0 (http://localhost:62294/__cypress/runner/cypress_runner.js:137445:10)
    at Promise._settlePromises (http://localhost:62294/__cypress/runner/cypress_runner.js:137524:18)
    at Promise._fulfill (http://localhost:62294/__cypress/runner/cypress_runner.js:137469:18)
    at Promise._resolveCallback (http://localhost:62294/__cypress/runner/cypress_runner.js:137263:57)]]>
      </failure>
    </testCase>
    <testCase name="The root suite - Another sub suite - Test case #4 (must be skipped)" duration="0">
      <skipped message="skipped test"/>
    </testCase>
    <testCase name="The root suite - Another sub suite - Test case #5 (must raise an error)" duration="488">
      <error message="TypeError: Cannot read property 'toString' of undefined">
        <![CDATA[TypeError: Cannot read property 'toString' of undefined
    at Context.<anonymous> (http://localhost:62294/__cypress/tests?p=test\cypress\integration\Sample.spec.js-285:37:17)]]>
      </error>
    </testCase>
  </file>
</testExecutions>
```

## Sample

A sample project demonstrating the use of this reporter in a React App with Cypress and SonarQube is available in [example](./example/) folder

## From Mocha tests result to SonarQube Generic Execution report

The following table explains the association between test states and the generated XML part:

| Mocha test state                                    | SonarQube Execution `testCase` child node |
| --------------------------------------------------- | ----------------------------------------- |
| `"passed"`                                          | none |
| `"pending"`                                         | `<skipped message="skipped test"/>` short message is always "skipped message" |
| `"skipped"`                                         | `<skipped message="An error occurred during a hook and remaining tests in the current suite are skipped"/>` |
| `"failed"` and `test.err.name === "AssertionError"` | `<failure message="AssertionError: expected true to be false"><![CDATA[AssertionError: expected true to be false    at ...]]></failure>` |
| `"failed"` and `test.err.name !== "AssertionError"` | `<error message="TypeError: Cannot read property 'toString' of undefined"><![CDATA[TypeError: Cannot read property 'toString' of undefined    at ...]]></error>` |

## Installing

In Node.js environnement, use your favorite command:

`npm install --save-dev cypress-sonarqube-reporter`

`yarn add --dev cypress-sonarqube-reporter`

## Usage

### As a single Cypress reporter

As described in [Cypress documentation](https://docs.cypress.io/guides/tooling/reporters#Reporter-Options), single configuration:

With Cypress version >= v10.x
```javascript
// File: cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
	reporter: 'cypress-sonarqube-reporter',
	reporterOptions: {
    	// see "Reporter Options" section
	}
});
```

With Cypress version < v10.x
```json
// File: cypress.json
{
	"reporter": "cypress-sonarqube-reporter",
	"reporterOptions": {
		// see "Reporter Options" section
	}
}
```

### Using Cypress multiple reporters plugin

As described in [Cypress documentation](https://docs.cypress.io/guides/tooling/reporters#Multiple-reporters), multi configuration:

```json
// File: cypress.json
{
	"reporter": "cypress-multi-reporters",
	"reporterOptions": {
		"reporterEnabled": "cypress-sonarqube-reporter, mochawesome",
		"mochawesomeReporterOptions": {
			// mochawesome options...
		},
		"cypressSonarqubeReporterReporterOptions": {
			// see "Reporter Options" section
		}
	}
}
```

### Spec files update

EDIT: since v1.11.0, this code snippet is useless if you're using Cypress v6+.

~~The magic behind the scene is the use of `Cypress.spec` object (see [Cypress documentation](https://docs.cypress.io/api/cypress-api/spec.html#Syntax)) that is only available on spec files (ie not on reporter scope), so the drawback of this workaround is to use the function `specTitle(title: string)` from `specTitle.js` instead of the suite title:~~
```js
const specTitle = require('cypress-sonarqube-reporter/specTitle');

describe(specTitle('The root suite'), () => {
	...
});
```
~~This `Cypress.spec` object is only available since Cypress v3.0.2 (see [Cypress changelog](https://docs.cypress.io/guides/references/changelog.html#3-0-2))~~

~~To avoid suite title pollution in other reporters (like the great [mochawesome](https://github.com/adamgruber/mochawesome#mochawesome)), make sure that `cypress-sonarqube-reporter` is the first one in the list.~~

### Merging reports into a single report

Since v1.10.0, you could merge all the generated reports into a single report. It could ease the configuration of your SonarQube analysis.

This feature is only available on Cypress version >= 6.2.0, since the `after:run` plugin event does not exist on previous versions (see [Cypress changelog](https://docs.cypress.io/guides/references/changelog#6-2-0)).

The merge operation has to be configured in Cypress plugins:
```javascript
// File: cypress/plugins/index.js
module.exports = (on, config) => {
	// https://docs.cypress.io/api/plugins/after-run-api
	on('after:run', (results) => {
		// /!\ don't forget to return the Promise /!\
		return require('cypress-sonarqube-reporter/mergeReports')(results);
	});
};
```
or if you need to specify plugin's options:
```javascript
// File: cypress/plugins/index.js
module.exports = (on, config) => {
	// https://docs.cypress.io/api/plugins/after-run-api
	on('after:run', (results) => {
		// /!\ don't forget to return the Promise /!\
		return require('cypress-sonarqube-reporter/mergeReports')(results, {
			// see "Merge Plugin Options" section for all available options
			mergeFileName: 'another-name.xml'
		});
	});
};
```

## Reporter Options

| Name                  | Type      | Default                               | Description |
| --------------------- | --------- | ------------------------------------- | ----------- |
| `outputDir`           | `string`  | `"./dist"`                            | folder name for the generated SonarQube XML reports, will be automatically created if not exist |
| `preserveSpecsDir`    | `boolean` | `true`                                | specify if tests folders structure should be preserved |
| `overwrite`           | `boolean` | `false`                               | specify if existing reporters could be overwritten; if `false` then an error is raised when reports already exist |
| `prefix`              | `string`  | `""`                                  | file prefix for the generated SonarQube XML reports |
| `useFullTitle`        | `boolean` | `true`                                | specify if test case should combine all parent suite(s) name(s) before the test title or only the test title |
| `titleSeparator`      | `string`  | `" - "`                               | the separator used between combined parent suite(s) name(s); only used if `useFullTitle` is `true` |
| `useAbsoluteSpecPath` | `boolean` | `false`                               | specify if the absolute path of a spec file should be written to the report |
| `mergeOutputDir`      | `string`  | `<none>`                              | folder name for the merged SonarQube XML report, will be automatically created if not exist. If not specified, `outputDir` is used |
| `mergeFileName`       | `string`  | `"cypress-sonarqube-reports.all.xml"` | merged SonarQube XML report name |

## Merge Plugin Options

| Name                  | Type      | Default                               | Description |
| --------------------- | --------- | ------------------------------------- | ----------- |
| `reportsOutputDir`    | `string`  | `"./dist"`                            | folder name for the generated SonarQube XML reports. If not specified, reporter options are used |
| `mergeOutputDir`      | `string`  | `<none>`                              | folder name for the merged SonarQube XML report, will be automatically created if not exist. If not specified, `reportsOutputDir` is used |
| `mergeFileName`       | `string`  | `"cypress-sonarqube-reports.all.xml"` | merged SonarQube XML report name |

## Issues & Enhancements

![GitHub issues](https://img.shields.io/github/issues-raw/BBE78/cypress-sonarqube-reporter)
![GitHub issues](https://img.shields.io/github/issues-closed-raw/BBE78/cypress-sonarqube-reporter)

For any bugs, enhancements, or just questions feel free to use the [GitHub Issues](https://github.com/BBE78/cypress-sonarqube-reporter/issues)

## Licence

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/cypress-io/cypress/blob/master/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FBBE78%2Fcypress-sonarqube-reporter.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FBBE78%2Fcypress-sonarqube-reporter?ref=badge_large)
