
const cypress = require("cypress");
const cypressDefaultConfig = require("./CypressDefaultConfig");
const fse = require("fs-extra");
const { cleanOuputDir, verifyReportExists, verifyGeneratedReport } = require("./TestUtils");


describe("Testing reporter", () => {

    const cypressRunTimeout = 30000;

    describe("with default options", () => {

        beforeAll(() => {
            cleanOuputDir("dist/test");
        });

        test("running Cypress", () => {
            return cypress.run(cypressDefaultConfig).then(() => {
                const path = "dist/test/cypress/integration/Sample.spec.js.xml";
                verifyReportExists(path);
                verifyGeneratedReport(path);
            });
        }, cypressRunTimeout);
    });

    describe("with option(s): preserveSpecsDir=false, prefix, titleSeparator", () => {

        beforeAll(() => {
            cleanOuputDir("dist/preserve");
        });

        test("running Cypress", () => {
            const config = Object.assign(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: "dist/preserve",
                    preserveSpecsDir: false,
                    prefix: "myPrefix.",
                    titleSeparator: "|"
                }
            });
            return cypress.run(config).then(() => {
                const path = "dist/preserve/myPrefix.Sample.spec.js.xml";
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions.titleSeparator);
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): useFullTitle=false", () => {

        beforeAll(() => {
            cleanOuputDir("dist/useFullTitle");
        });

        test("running Cypress", () => {
            const config = Object.assign(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: "dist/useFullTitle",
                    useFullTitle: false
                }
            });
            return cypress.run(config).then(() => {
                const path = "dist/useFullTitle/test/cypress/integration/Sample.spec.js.xml";
                verifyReportExists(path);
                verifyGeneratedReport(path, config.reporterOptions.titleSeparator, config.reporterOptions.useFullTitle);
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): overwrite=false", () => {

        const path = "dist/overwriteFalse/Sample.spec.js.xml";

        beforeAll(() => {
            cleanOuputDir("dist/overwriteFalse");
            fse.outputFileSync(path, "should not be overwritten", { encoding: "utf8" });
        });

        test("running Cypress", () => {
            const config = Object.assign(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: "dist/overwriteFalse",
                    overwrite: false,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).then(() => {
                verifyReportExists(path);
                const data = fse.readFileSync(path, { encoding: "utf8" });
                expect(data).toBe("should not be overwritten");
            });
        }, cypressRunTimeout);

    });

    describe("with option(s): overwrite=true", () => {

        const path = "dist/overwriteTrue/Sample.spec.js.xml";

        beforeAll(() => {
            cleanOuputDir("dist/overwriteTrue");
            fse.outputFileSync(path, "should be overwritten", { encoding: "utf8" });
        });

        test("running Cypress", () => {
            const config = Object.assign(cypressDefaultConfig, {
                reporterOptions: {
                    outputDir: "dist/overwriteTrue",
                    overwrite: true,
                    preserveSpecsDir: false
                }
            });
            return cypress.run(config).then(() => {
                verifyReportExists(path);
                verifyGeneratedReport(path);
            });
        }, cypressRunTimeout);

    });

    describe.skip("with cypress-multi-reporters (and mochawesome)", () => {

        beforeAll(() => {
            cleanOuputDir("dist/multi");
        });

        test("running Cypress", () => {
            const config = Object.assign(cypressDefaultConfig, {
                reporter: "cypress-multi-reporters",
                reporterOptions: {
                    configFile: "test/cypress-reporters.json"
                }
            });
            return cypress.run(config).then(() => {
                const path = "dist/multi/test/cypress/integration/Sample.spec.js.xml";
                verifyReportExists(path);
                verifyGeneratedReport(path);
            });
        }, cypressRunTimeout);

    });

});
