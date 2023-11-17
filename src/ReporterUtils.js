const chalk = require('chalk');
const fse = require('fs-extra');
const path = require('path');
const pkg = require('../package.json');


/**
 * Log 'info' message to the console
 *
 * @param {string} message the info message to log
 */
const info = (message) => {
    // eslint-disable-next-line no-console
    console.info(`[${chalk.grey(pkg.name)}] ${message}`);
};

/**
 * Log 'warn' message to the console
 *
 * @param {string} message the warn message to log
 */
const warn = (message) => {
    // eslint-disable-next-line no-console
    console.warn(`[${chalk.yellow(pkg.name)}] ${message}`);
};

/**
 * Log 'error' message to the console, and throw an Error
 *
 * @param {string} message the error message
 */
const throwError = (message) => {
    // eslint-disable-next-line no-console
    console.error(`[${chalk.red(pkg.name)}] ${message}`);
    throw new Error(message);
};

/**
 * Extract the spec file path from the suite.
 * May ignore the options.useAbsoluteSpecPath if the requested is not available.
 * Raise an error if the spec could not be extracted.
 *
 * @param {object} suite the Mocha suite
 * @param {object} options the Reporter Options
 * @returns {string} the spec file path
 */
const extractSpecFromSuite = (suite, options) => {
    const title = suite.title;
    const tag = '[@spec: ';
    const index = title?.indexOf(tag);
    let spec;
    if (index > -1) {
        spec = JSON.parse(title.substring(index + tag.length, title.lastIndexOf(']')));
        spec = options.useAbsoluteSpecPath ? spec.absolute : spec.relative;
    } else if (suite.invocationDetails?.absoluteFile || suite.invocationDetails?.relativeFile) {
        spec = options.useAbsoluteSpecPath ? suite.invocationDetails.absoluteFile : suite.invocationDetails.relativeFile;
    } else if (suite.parent?.file) {
        spec = suite.parent.file;
    } else {
        throwError(`could not find spec filename from title: ${title} or from 'suite.invocationDetails'`);
    }
    return spec.replace(/\\/g, '/');
};

/**
 * Extract the suite title from the suite.
 *
 * @param {object} suite the Mocha suite
 * @returns {string} the original suite title
 */
const extractTitleFromSuite = (suite) => {
    const title = suite.title;
    const index = title.indexOf('[@spec:');
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
    if (suite.parent && suite.parent.title !== '') {
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
    const testNode = node.element('testCase')
        .attribute('name', formatTestTitle(test, options))
        .attribute('duration', test.duration || 0);
    switch (test.state) {
        case 'failed':
            if (test.err.name === 'AssertionError') {
                testNode.element('failure')
                    .attribute('message', `${test.err.name}: ${test.err.message}`)
                    .cdata(test.err.stack);
            } else {
                testNode.element('error')
                    .attribute('message', `${test.err.name}: ${test.err.message}`)
                    .cdata(test.err.stack);
            }
            break;
        case 'pending':
            testNode.element('skipped')
                .attribute('message', 'skipped test');
            break;
        case 'skipped':
            testNode.element('skipped')
                .attribute('message', 'An error occurred during a hook and remaining tests in the current suite are skipped');
            break;
        case 'passed':
            // nothing to do...
            break;
        default:
            throwError(`unknown test state: ${test.state}`);
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
        throwError(`the reporter '${file}' already exists`);
    } else {
        try {
            fse.outputFileSync(file, data, 'utf8');
            info(`report saved to '${file}'`);
        } catch(err) {
            throwError(`could not write file '${file}': ${err}`);
        }
    }
};

module.exports = {
    DEFAULT_MERGED_FILE_NAME: 'cypress-sonarqube-reports.all.xml',
    DEFAULT_OUTPUT_DIR: './dist',
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    formatTestTitle,
    formatSuiteTitle,
    info,
    warn,
    writeFile
};
