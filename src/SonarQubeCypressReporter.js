"use strict";

const colors = require("colors");
const fse = require("fs-extra");
const path = require("path");
const xmlbuilder = require("xmlbuilder");
const Mocha = require("mocha");

// Mocha runner events
const {
    EVENT_RUN_END
} = Mocha.Runner.constants;

// the default reporter options
const defaultOptions = {
    outputDir: "./dist",
    preserveSpecsDir: true,
    overwrite: false,
    prefix: "",
    useFullTitle: true,
    titleSeparator: " - "
};

/**
 * SonarQubeCypressReporter
 */
class SonarQubeCypressReporter {

    /**
     * Constructor as explained in https://mochajs.org/api/tutorial-custom-reporter.html
     *
     * @param {object} runner - the mocha runner
     * @param {object} options - the user reporter options
     */
    constructor(runner, options) {
        this.options = Object.assign(defaultOptions, options.reporterOptions);
        this.specFilename = "none";

        runner.once(EVENT_RUN_END, () => {
            this.onDone(runner);
        });
    }

    /**
     * Build the XML report based on runner result
     *
     * @param {object} runner the Mocha runner
     */
    onDone(runner) {
        const node = xmlbuilder.create("testExecutions", { encoding: "utf-8" })
            .attribute("version", 1)
            .element("file");
        this.traverseSuite(node, runner.suite);
        const xml = node.end({ pretty: true });
        this.writeFile(xml);
    }

    /**
     * Traverse the suite and all sub suite(s) for tests results
     *
     * @param {object} node the <file> node
     * @param {object} suite a Mocha suite
     */
    traverseSuite(node, suite) {

        if (suite.parent && suite.parent.root) {
            this.specFilename = this.extractSpecFromSuite(suite);
            suite.title = this.extractTitleFromSuite(suite);
            node.attribute("path", this.specFilename);
        }

        suite.tests.forEach((test) => {
            this.formatTest(node, test);
        });
        suite.suites.forEach((subSuite) => {
            this.traverseSuite(node, subSuite);
        });
    }

    /**
     * Extract the spec file path from the suite.
     * Raise an error if the spec could not be extracted.
     *
     * @param {object} suite the Mocha suite
     * @returns {string} the spec file path
     */
    extractSpecFromSuite(suite) {
        const title = suite.title;
        const tag = "[@spec: ";
        const index = title.indexOf(tag);
        if (index > -1) {
            return title.substring(index + tag.length, title.lastIndexOf("]")).replace(/\\/g, "/");
        } else {
            const error = `could not find spec filename from title: ${title}`;
            this.error(error);
            throw new Error(error);
        }
    }

    /**
     * Extract the suite title from the suite.
     *
     * @param {object} suite the Mocha suite
     * @returns {string} the original suite title
     */
    extractTitleFromSuite(suite) {
        const title = suite.title;
        const index = title.indexOf("[@spec: ");
        if (index > -1) {
            return title.substring(0, index).trim();
        } else {
            return title;
        }
    }

    /**
     * Build <testCase> node according to specified test
     *
     * @param {object} node the XML <file> node
     * @param {object} test the Mocha test
     */
    formatTest(node, test) {
        const testNode = node.element("testCase")
            .attribute("name", this.formatTestTitle(test))
            .attribute("duration", test.duration || 0);
        switch (test.state) {
            case "failed":
                if (test.err.name === "AssertionError") {
                    testNode.element("failure")
                    .attribute("message", `${test.err.name}: ${test.err.message}`)
                    .cdata(test.err.stack);
                } else {
                    testNode.element("error")
                    .attribute("message", `${test.err.name}: ${test.err.message}`)
                    .cdata(test.err.stack);
                }
                break;
            case "pending":
                testNode.element("skipped")
                    .attribute("message", "skipped test");
                break;
            case "passed":
                // nothing to do...
                break;
            default:
                this.error(`unknown test state: ${test.state}`);
        }
    }

    /**
     * Format the test title
     *
     * @param {object} test the Mocha test
     * @returns {string} the formatted test title
     */
    formatTestTitle(test) {
        if (this.options.useFullTitle) {
            return `${this.formatSuiteTitle(test.parent)}${this.options.titleSeparator}${test.title}`;
        } else {
            return test.title;
        }
    }

    /**
     * Format the suite title(s)
     *
     * @param {object} suite the Mocha suite
     * @returns {string} the aggregation of title suite(s)
     */
    formatSuiteTitle(suite) {
        if (suite.parent && suite.parent.title !== "") {
            return `${this.formatSuiteTitle(suite.parent)}${this.options.titleSeparator}${this.extractTitleFromSuite(suite)}`;
        } else {
            return this.extractTitleFromSuite(suite);
        }
    }

    /**
     * Write the XML report
     *
     * @param {string} xml
     */
    writeFile(xml) {
        const specFilePath = (this.options.preserveSpecsDir) ? this.specFilename : path.basename(this.specFilename);
        const file = path.resolve(this.options.outputDir, `${this.options.prefix}${specFilePath}.xml`);
        if (!this.options.overwrite && fse.existsSync(file)) {
            const error = `the reporter "${file}" already exists`;
            this.error(error);
            throw error;
        } else {
            fse.outputFile(file, xml, "utf8", (error) => {
                if (error) {
                    this.error(`could not write file "${file}": ${error}`);
                    throw error;
                } else {
                    this.info(`report saved to "${file}"`);
                }
            });
        }
    }

    /**
     * Log "info" message to the console
     *
     * @param {string} message
     */
    info(message) {
        console.error(`[${colors.grey("cypress-sonarqube-reporter")}] ${message}`);
    }

    /**
     * Log "error" message to the console
     *
     * @param {string} message
     */
    error(message) {
        console.error(`[${colors.red("cypress-sonarqube-reporter")}] ${message}`);
    }

}

module.exports = SonarQubeCypressReporter;
