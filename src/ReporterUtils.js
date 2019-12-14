const colors = require("colors");
const fse = require("fs-extra");
const path = require("path");


/**
 * Log "info" message to the console
 *
 * @param {string} message
 */
const info = (message) => {
    // eslint-disable-next-line no-console
    console.info(`[${colors.grey("cypress-sonarqube-reporter")}] ${message}`);
};

/**
 * Log "error" message to the console
 *
 * @param {string} message
 */
const error = (message) => {
    // eslint-disable-next-line no-console
    console.error(`[${colors.red("cypress-sonarqube-reporter")}] ${message}`);
    throw message;
};

/**
 * Extract the spec file path from the suite.
 * Raise an error if the spec could not be extracted.
 *
 * @param {object} suite the Mocha suite
 * @returns {string} the spec file path
 */
const extractSpecFromSuite = (suite) => {
    const title = suite.title;
    const tag = "[@spec: ";
    const index = title.indexOf(tag);
    if (index > -1) {
        return title.substring(index + tag.length, title.lastIndexOf("]")).replace(/\\/g, "/");
    } else {
        const err = `could not find spec filename from title: ${title}`;
        error(err);
    }
};

/**
 * Extract the suite title from the suite.
 *
 * @param {object} suite the Mocha suite
 * @returns {string} the original suite title
 */
const extractTitleFromSuite = (suite) => {
    const title = suite.title;
    const index = title.indexOf("[@spec:");
    if (index > -1) {
        return title.substring(0, index).trim();
    } else {
        return title;
    }
};

/**
 * Format the suite title(s)
 *
 * @param {object} suite the Mocha suite
 * @returns {string} the aggregation of title suite(s)
 */
const formatSuiteTitle = (suite, options) => {
    if (suite.parent && suite.parent.title !== "") {
        return `${formatSuiteTitle(suite.parent, options)}${options.titleSeparator}${extractTitleFromSuite(suite)}`;
    } else {
        return extractTitleFromSuite(suite);
    }
};

/**
 * Format the test title
 *
 * @param {object} test the Mocha test
 * @returns {string} the formatted test title
 */
const formatTestTitle = (test, options) => {
    if (test.parent && options.useFullTitle) {
        return `${formatSuiteTitle(test.parent, options)}${options.titleSeparator}${test.title}`;
    } else {
        return test.title;
    }
};

/**
 * Build <testCase> node according to specified test
 *
 * @param {object} node the XML <file> node
 * @param {object} test the Mocha test
 */
const formatTest = (node, test, options) => {
    const testNode = node.element("testCase")
        .attribute("name", formatTestTitle(test, options))
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
            error(`unknown test state: ${test.state}`);
    }
};

/**
 * Write the report
 *
 * @param {string} data
 */
const writeFile = (specFilename, data, options) => {
    const specFilePath = (options.preserveSpecsDir) ? specFilename : path.basename(specFilename);
    const file = path.resolve(options.outputDir, `${options.prefix}${specFilePath}.xml`);
    if (!options.overwrite && fse.existsSync(file)) {
        const err = `the reporter "${file}" already exists`;
        error(err);
    } else {
        /*fse.outputFile(file, data, "utf8", (err) => {
            if (err) {
                error(`could not write file "${file}": ${err}`);
            } else {
                info(`report saved to "${file}"`);
            }
        });*/
        return fse.outputFile(file, data, "utf8")
            .then(() => {
                info(`report saved to "${file}"`);
            })
            .catch((err) => {
                error(`could not write file "${file}": ${err}`);
            });
    }
};

module.exports = {
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    formatTestTitle,
    formatSuiteTitle,
    writeFile
};
