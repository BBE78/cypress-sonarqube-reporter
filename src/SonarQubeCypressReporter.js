const xmlbuilder = require('xmlbuilder');
const Mocha = require('mocha');
const {
    DEFAULT_OUTPUT_DIR,
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    writeFile,
    warn
} = require('./ReporterUtils');


// Mocha runner events
const {
    EVENT_RUN_END
} = Mocha.Runner.constants;

// the default reporter options
const defaultOptions = {
    outputDir: DEFAULT_OUTPUT_DIR,
    preserveSpecsDir: true,
    overwrite: false,
    prefix: '',
    useFullTitle: true,
    titleSeparator: ' - ',
    useAbsoluteSpecPath: false
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
        this.specFilename = 'none';

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
        if ((runner.suite.tests?.length > 0) || (runner.suite.suites?.length > 0)) {
            const node = xmlbuilder.create('testExecutions', { encoding: 'utf-8' })
                .attribute('version', 1)
                .element('file');
            this.traverseSuite(node, runner.suite);
            const xml = node.end({ pretty: true });
            writeFile(this.specFilename, xml, this.options);
        } else {
            warn('empty suite detected, skipping SonarQube report generation');
        }
    }

    /**
     * Traverse the suite and all sub suite(s) for tests results
     *
     * @param {object} node the <file> node
     * @param {object} suite a Mocha suite
     */
    traverseSuite(node, suite) {
        if (suite.parent && suite.parent.root) {
            this.specFilename = extractSpecFromSuite(suite, { useAbsoluteSpecPath: false });
            const specFilePath = extractSpecFromSuite(suite, this.options);
            suite.title = extractTitleFromSuite(suite);
            node.attribute('path', specFilePath);
        }

        suite.tests.forEach((test) => {
            formatTest(node, test, this.options);
        });

        suite.suites.forEach((subSuite) => {
            this.traverseSuite(node, subSuite);
        });
    }

}

module.exports = SonarQubeCypressReporter;
