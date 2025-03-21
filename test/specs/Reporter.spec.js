/* eslint jest/expect-expect: ['error', { 'assertFunctionNames': ['expect', 'verifyReport', 'verifyReportExists'] }] */

const cypress = require('cypress');
const fs = require('fs');
const path = require('path');

const {
    cleanOuputDir,
    createFile,
    overwriteConfig,
    readFile,
    verifyReportExists,
    verifyReport,
    verifyReportNotExists
} = require('./TestUtils');

// Folder that will contains all generated files from tests
const testOuputDir = path.resolve('dist', 'test');

/**
 * Indicates if Cypress depenency version is greater than the expected one
 *
 * @param {number} majorVersion
 * @param {number} minorVersion
 * @returns {boolean} true if Cypress version is greater than the expected
 */
 const isCypressVersionAtLeast = (majorVersion, minorVersion = 0) => {
    const cypressVersion = require('cypress/package.json').version;
    const splitted = cypressVersion.split('.');
    const cypressMajorVersion = parseInt(splitted[0]);
    const cypressMinorVersion = parseInt(splitted[1]);
    return (cypressMajorVersion >= majorVersion) && (cypressMinorVersion >= minorVersion);
};

const isCypressVersionGreaterThanV10 = () => {
    return isCypressVersionAtLeast(10);
};

const cypressDefaultConfig = isCypressVersionGreaterThanV10()
    ? require('./Cypressv10DefaultConfig')
    : require('./CypressDefaultConfig');

describe('Testing reporter', () => {

    // Running Cypress could sometimes take a long time...
    const cypressRunTimeout = 90000;

    /**
     * The "cypress.json" could not exist with "cypress.config.js" with Cypress >= v10.
     * So be compatible with all Cypress versions, the "cypress.json" is created "on the fly" during the tests
     */
    beforeAll(() => {
        if (!isCypressVersionGreaterThanV10() && !fs.existsSync('cypress.json')) {
            return fs.promises.writeFile('cypress.json', '{}');
        }
    });

    afterAll(() => {
        if (fs.existsSync('cypress.json')) {
            return fs.promises.unlink('cypress.json');
        }
    });

    describe('with default options', () => {

        beforeAll(() => {
            cleanOuputDir(path.resolve(testOuputDir, 'cypress'));
        });

        test('running Cypress', () => {
            return cypress.run(cypressDefaultConfig).then(() => {
                const reportPath = path.resolve(testOuputDir, 'cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath);
            });
        }, cypressRunTimeout);
    });

    describe('with option(s): preserveSpecsDir=false, prefix, titleSeparator', () => {

        const testDir = path.resolve(testOuputDir, 'preserveFalse');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
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
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): preserveSpecsDir=true, prefix', () => {

        const testDir = path.resolve(testOuputDir, 'preserveTrue');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    preserveSpecsDir: true,
                    prefix: 'myPrefix.'
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/myPrefix.Sample.spec.js.xml');
                verifyReport(reportPath, config);
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): useFullTitle=false', () => {

        const testDir = path.resolve(testOuputDir, 'useFullTitleFalse');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    useFullTitle: false
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath, config);
            });
        }, cypressRunTimeout);

    });

    describe('with option(s): useAbsoluteSpecPath=true', () => {

        const testDir = path.resolve(testOuputDir, 'useAbsoluteSpecPathTrue');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    useAbsoluteSpecPath: true
                }
            });
            return cypress.run(config).then(() => {
                const reportPath = path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml');
                verifyReport(reportPath, config);
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
            const config = overwriteConfig(cypressDefaultConfig, {
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
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: true,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).then(() => {
                verifyReport(reportPath, config);
            });
        }, cypressRunTimeout);

    });

    describe.skip('with cypress-multi-reporters (and mochawesome)', () => {

        const testDir = path.resolve(testOuputDir, 'multi');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
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
            });
        }, cypressRunTimeout);

    });

    xdescribe('with multiple spec files', () => {

        const conditionalTest = isCypressVersionAtLeast(6, 2) ? test : test.skip;
        const testDir = path.resolve(testOuputDir, 'multi-specs');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        conditionalTest('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir
                }
            });
            config.config.pluginsFile = 'test/cypress/plugins/index-with-merge.js';
            config.config.testFiles = '**/*.spec.js';
            return cypress.run(config).then(() => {
                verifyReport(path.resolve(testDir, 'test/cypress/integration/Sample.spec.js.xml'), config);
                verifyReportExists(path.resolve(testDir, 'test/cypress/integration/Another.spec.js.xml'));
            });
        }, cypressRunTimeout);
    });

    describe('without specTitle()', () => {

        const conditionalTest = isCypressVersionAtLeast(6, 2) ? test : test.skip;
        const testDir = path.resolve(testOuputDir, 'withoutSpecTitle');
        const reportPath = path.resolve(testDir, 'WithoutSpecTitle.spec.js.xml');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        conditionalTest('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: false,
                    preserveSpecsDir: false
                }
            });
            if (isCypressVersionGreaterThanV10()) {
                config.spec = '**/WithoutSpecTitle.spec.js';
            } else {
                config.config.testFiles = '**/WithoutSpecTitle.spec.js';
            }
            return cypress.run(config).then(() => {
                verifyReport(reportPath, config, 'WithoutSpecTitle.spec.js', isCypressVersionGreaterThanV10());
            });
        }, cypressRunTimeout);

    });

    describe('with empty suite', () => {

        const testDir = path.resolve(testOuputDir, 'withEmptySuite');
        const reportPath = path.resolve(testDir, 'EmptySuite.spec.js.xml');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        test('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: false,
                    preserveSpecsDir: false
                }
            });
            if (isCypressVersionGreaterThanV10()) {
                config.spec = '**/EmptySuite.spec.js';
            } else {
                config.config.testFiles = '**/EmptySuite.spec.js';
            }
            return cypress.run(config).then(() => {
                verifyReportNotExists(reportPath);
                verifyReportNotExists(path.resolve(testDir, 'none.xml'));
                verifyReportNotExists(testDir);
            });
        }, cypressRunTimeout);

    });

    describe('component test', () => {

        const conditionalTest = isCypressVersionAtLeast(11, 0) ? test : test.skip;
        const testDir = path.resolve(testOuputDir, 'component');
        const reportPath = path.resolve(testDir, 'MyComponent.spec.js.xml');

        beforeAll(() => {
            cleanOuputDir(testDir);
        });

        conditionalTest('running Cypress', () => {
            const config = overwriteConfig(cypressDefaultConfig, {
                testingType: 'component',
                reporterOptions: {
                    outputDir: testDir,
                    overwrite: false,
                    preserveSpecsDir: false
                },
            });
            config.spec= '**/MyComponent.spec.js';

            return cypress.run(config).then(() => {
                verifyReport(reportPath, config, 'MyComponent.spec.js', true, true);
            });
        }, cypressRunTimeout);

    });

});
