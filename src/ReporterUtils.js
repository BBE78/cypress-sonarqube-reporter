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
 * Check if tag @spec is in title
 *
 * @param {object} suite the Mocha suite
 * @returns {boolean}
 */
const hasSpecInTitle = function (suite){
    return suite.title.indexOf("[@spec: ") !== -1;
}

/**
 * Extract the spec file path from the suite.
 * Raise an error if the spec could not be extracted.
 *
 * @param {object} suite the Mocha suite
 * @param {object} options the Reporter Options
 * @returns {string} the spec file path
 */
const extractSpecFromSuite = (suite, options) => {
    const title = suite.title;
    const tag = "[@spec: ";
    const index = title.indexOf(tag);
    if (index > -1) {
        let spec = JSON.parse(title.substring(index + tag.length, title.lastIndexOf("]")));
        spec = options.useAbsoluteSpecPath ? spec.absolute : spec.relative;
        return spec.replace(/\\/g, "/");
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
        case "skipped":
            testNode.element("skipped")
                .attribute("message", "An error occurred during a hook and remaining tests in the current suite are skipped");
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
    const file = path.resolve(options.outputDir, path.dirname(specFilePath), `${options.prefix}${path.basename(specFilePath)}.xml`);
    if (!options.overwrite && fse.existsSync(file)) {
        error(`the reporter "${file}" already exists`);
    } else {
        try {
            fse.outputFileSync(file, data, "utf8");
            info(`report saved to "${file}"`);
        } catch(err) {
            error(`could not write file "${file}": ${err}`);
            throw err;
        }
    }
};

module.exports = {
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    formatTestTitle,
    formatSuiteTitle,
    writeFile,
    hasSpecInTitle
};
