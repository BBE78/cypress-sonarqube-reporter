/* eslint jest/expect-expect: ['error', { 'assertFunctionNames': ['expect', 'verifyReport', 'verifyReportExists'] }] */

const cypress = require('cypress');
const cypressDefaultConfig = require('./CypressDefaultConfig');
const {
    cleanOuputDir,
    createFile,
    overwriteConfig,
    readFile,
    verifyReportExists,
    verifyReport
} = require('./TestUtils');
const path = require('path');

// Folder that will contains all generated files from tests
const testOuputDir = path.resolve('dist', 'test');


describe('Testing reporter', () => {

    // Running Cypress could sometimes take a long time...
    const cypressRunTimeout = 90000;

    describe('with default options', () => {

        beforeAll(() => {
            cleanOuputDir(path.resolve(testOuputDir, 'cypress'));
        });

        test('running Cypress', () => {
            return cypress.run(cypressDefaultConfig).then(() => {
                const reportPath = path.resolve(testOuputDir, 'cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);
    });

    describe('with option(s): preserveSpecsDir=false, prefix, titleSeparator', () => {

        const testDir = path.resolve(testOuputDir, 'preserveFalse');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    preserveSpecsDir: false,
                    prefix: 'myPrefix.',
                    titleSeparator: '|'
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'myPrefix.Sample.spec.js.xml');
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): preserveSpecsDir=true, prefix', () => {

        const testDir = path.resolve(testOuputDir, 'preserveTrue');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    preserveSpecsDir: true,
                    prefix: 'myPrefix.'
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/myPrefix.Sample.spec.js.xml');
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): useFullTitle=false', () => {

        const testDir = path.resolve(testOuputDir, 'useFullTitleFalse');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    useFullTitle: false
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): useAbsoluteSpecPath=true', () => {

        const testDir = path.resolve(testOuputDir, 'useAbsoluteSpecPathTrue');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    useAbsoluteSpecPath: true
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): overwrite=false', () => {

        const testDir = path.resolve(testOuputDir, 'overwriteFalse');
        const reportPath = path.resolve(testDir, 'Sample.spec.js.xml');

        beforeAll(() => {
            cleanOuputDir(testDir);
            createFile(reportPath, 'should not be overwritten');
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: false,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).catch(() => {
                verifyReportExists(reportPath);
                const data = readFile(reportPath);
                expect(data).toBe('should not be overwritten');
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): overwrite=true', () => {

        const testDir = path.resolve(testOuputDir, 'overwriteTrue');
        const reportPath = path.resolve(testDir, 'Sample.spec.js.xml');

        beforeAll(() => {
            cleanOuputDir(testDir);
            createFile(reportPath, 'should be overwritten');
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: true,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).then(() => {
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe.skip('with cypress-multi-reporters (and mochawesome)', () => {

        const testDir = path.resolve(testOuputDir, 'multi');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig({
                reporter: 'cypress-multi-reporters',
                reporterOptions: {
                    reporterEnabled: 'mochawesome, mocha-sonarqube-reporter',
                    indexJsReporterOptions: {
                        outputDir: testDir
                    },
                    danmastaMochaSonarReporterOptions: {
                        output: 'dist/multi/mocha-sonar/report.xml'
                    },
                    mochaSonarqubeReporterReporterOptions: {
                        output: 'dist/multi/mocha-sonarqube-reporter/report.xml'
                    },
                    mochawesomeReporterOptions: {
                        reportDir: 'dist/multi/mochawesome',
                        html: false,
                        json: true
                    }
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath, config);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe('with multiple spec files', () => {

        const isCypressVersionAtLeast = (majorVersion, minorVersion) => {
            const cypressVersion = require('cypress/package.json').version;
            const splitted = cypressVersion.split('.');
            const cypressMajorVersion = parseInt(splitted[0]);
            const cypressMinorVersion = parseInt(splitted[1]);
            return (cypressMajorVersion >= majorVersion) && (cypressMinorVersion >= minorVersion);
        };

        const conditionalTest = isCypressVersionAtLeast(6, 2) ? test : test.skip;
        const testDir = path.resolve(testOuputDir, 'multi-specs');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        conditionalTest('running Cypress', () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: testDir
                }
            });
            config.config.pluginsFile = 'test/cypress/plugins/index-with-merge.js';
            config.config.testFiles = '**/*.spec.js';
            return cypress.run(config).then(() => {
                verifyReport(path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml'), config);
                verifyReportExists(path.resolve(testDir, 'test/cypress/integration/Another.spec.js.xml'));
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);
    });

});
