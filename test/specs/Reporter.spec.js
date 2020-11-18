/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "verifyReportExists", "verifyGeneratedReport"] }] */

const cypress = require("cypress");
const cypressDefaultConfig = require("./CypressDefaultConfig");
const {
    cleanOuputDir,
    createFile,
    overwriteConfig,
    readFile,
    verifyReportExists,
    verifyGeneratedReport
} = require("./TestUtils");


describe("Testing reporter", () => {

    // Running Cypress could sometimes take a long time...
    const cypressRunTimeout = 90000;

    describe("with default options", () => {

        const testDir = "test";

        beforeAll(() => {
            cleanOuputDir(`dist/${testDir}`);
        });

        test("running Cypress", () => {
            return cypress.run(cypressDefaultConfig).then(() => {
                const path = `dist/${testDir}/cypress/integration/Sample.spec.js.xml`;
                verifyReportExists(path);
                verifyGeneratedReport(path);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);
    });

    describe("with option(s): preserveSpecsDir=false, prefix, titleSeparator", () => {

        const testDir = "preserveFalse";

        beforeAll(() => {
            cleanOuputDir(`dist/${testDir}`);
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: `dist/${testDir}`,
                    preserveSpecsDir: false,
                    prefix: "myPrefix.",
                    titleSeparator: "|"
                }
            });
            return cypress.run(config).then(() => {
                const path = `dist/${testDir}/myPrefix.Sample.spec.js.xml`;
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): preserveSpecsDir=true, prefix", () => {

        const testDir = "preserveTrue";

        beforeAll(() => {
            cleanOuputDir(`dist/${testDir}`);
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: `dist/${testDir}`,
                    preserveSpecsDir: true,
                    prefix: "myPrefix."
                }
            });
            return cypress.run(config).then(() => {
                const path = `dist/${testDir}/test/cypress/integration/myPrefix.Sample.spec.js.xml`;
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): useFullTitle=false", () => {

        const testDir = "useFullTitleFalse";

        beforeAll(() => {
            cleanOuputDir(`dist/${testDir}`);
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: `dist/${testDir}`,
                    useFullTitle: false
                }
            });
            return cypress.run(config).then(() => {
                const path = `dist/${testDir}/test/cypress/integration/Sample.spec.js.xml`;
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): useAbsoluteSpecPath=true", () => {

        const testDir = "useAbsoluteSpecPathTrue";

        beforeAll(() => {
            cleanOuputDir(`dist/${testDir}`);
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: `dist/${testDir}`,
                    useAbsoluteSpecPath: true
                }
            });
            return cypress.run(config).then(() => {
                const path = `dist/${testDir}/test/cypress/integration/Sample.spec.js.xml`;
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): overwrite=false", () => {

        const path = "dist/overwriteFalse/Sample.spec.js.xml";

        beforeAll(() => {
            cleanOuputDir("dist/overwriteFalse");
            createFile(path, "should not be overwritten");
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: "dist/overwriteFalse",
                    overwrite: false,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).catch(() => {
                verifyReportExists(path);
                const data = readFile(path);
                expect(data).toBe("should not be overwritten");
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): overwrite=true", () => {

        const path = "dist/overwriteTrue/Sample.spec.js.xml";

        beforeAll(() => {
            cleanOuputDir("dist/overwriteTrue");
            createFile(path, "should not be overwritten");
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporterOptions: {
                    outputDir: "dist/overwriteTrue",
                    overwrite: true,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).then(() => {
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

    describe.skip("with cypress-multi-reporters (and mochawesome)", () => {

        beforeAll(() => {
            cleanOuputDir("dist/multi");
        });

        test("running Cypress", () => {
            const config = overwriteConfig({
                reporter: "cypress-multi-reporters",
                reporterOptions: {
                    reporterEnabled: "mochawesome, mocha-sonarqube-reporter",
                    indexJsReporterOptions: {
                        outputDir: "dist/multi"
                    },
                    danmastaMochaSonarReporterOptions: {
                        output: "dist/multi/mocha-sonar/report.xml"
                    },
                    mochaSonarqubeReporterReporterOptions: {
                        output: "dist/multi/mocha-sonarqube-reporter/report.xml"
                    },
                    mochawesomeReporterOptions: {
                        reportDir: "dist/multi/mochawesome",
                        html: false,
                        json: true
                    }
                }
            });
            return cypress.run(config).then(() => {
                const path = "dist/multi/test/cypress/integration/Sample.spec.js.xml";
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions);
            }).catch(err => {
                throw err;
            });
        }, cypressRunTimeout);

    });

});
