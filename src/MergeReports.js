const fse = require('fs-extra');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const path = require('path');
const readdirp = require('readdirp');
const {
    DEFAULT_MERGED_FILE_NAME,
    DEFAULT_OUTPUT_DIR,
    info
} = require('./ReporterUtils');


/** XML parser options shared between read/write */
const XML_PARSER_OPTIONS = {
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '_',
    textNodeName: 'text',
    cdataTagName: '@cdata',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true
};


/**
 * An implementation of JavaScript optional chaining for backward compatibility
 * with Node.js < v14
 *
 * @param {Object} data
 * @param  {...string} props
 * @returns the value or undefined
 */
const optionalChaining = (data, ...props) => {
    try {
        let value = data;
        for (const prop of props) {
            value = value[prop];
        }
        return value;
    } catch (err) {
        return undefined;
    }
};


/**
 * Write the JSON data into the specified output file path
 *
 * @param {Path} outputPath the path of the merged XML report
 * @param {Object} mergedReportAsJSON the merge result as JSON structure
 * @returns {Promise} with the merged report path
 */
const writeMergedReport = (outputPath, mergedReportAsJSON) => {
    const xml = new XMLBuilder(XML_PARSER_OPTIONS).build(mergedReportAsJSON);
    const content = `<?xml version="1.0" encoding="utf-8"?>\n${xml}`;
    return new Promise((resolve, reject) => {
        const parentPath = path.dirname(outputPath);
        if (!fse.existsSync(parentPath)) {
            try {
                fse.mkdirSync(parentPath, { recursive: true });
            } catch (err) {
                reject(err);
            }
        }
        fse.writeFile(outputPath, content, (err) => {
            if (err) {
                reject(err);
            } else {
                info(`sonarqube reports successfully merged into '${outputPath}'`);
                resolve(outputPath);
            }
        });
    });
};


/**
 * Load the XML report as a JSON structure
 *
 * @param {Path} reportPath the XML report to load
 * @returns {Promise} with XML data converted as a JSON structure
 */
const loadReport = (reportPath) => {
    return new Promise((resolve, reject) => {
        fse.readFile(reportPath, { encoding: 'utf8' }, (err, xml) => {
            if (err) {
                reject(err);
            } else {
                const json = new XMLParser(XML_PARSER_OPTIONS).parse(xml);
                resolve(json);
            }
        });
    });
};


/**
 * Creates a JSON structure, merge result of all JSON reports
 *
 * @param {Object} reportsAsJSON
 * @returns {Object} the merge result of all reports as a JSON structure
 */
const createReportAsJSON = (reportsAsJSON) => {
    const mergedReportAsJSON = {
        testExecutions: {
            _version: 1,
            file: []
        }
    };
    for (const reportAsJSON of reportsAsJSON) {
        mergedReportAsJSON.testExecutions.file.push(reportAsJSON.testExecutions.file);
    }

    return mergedReportAsJSON;
}


/**
 * Merge all SonarQube XML reports into a single XML report.
 *
 * @param {Path} outputPath the path of the merged XML report
 * @param {Path[]} reportPaths the list of reports path to merge
 * @returns {Promise} the merged report path
 */
const mergeReportFiles = (outputPath, reportPaths) => {
    return new Promise((resolve, reject) => {
        if (reportPaths.length > 0) {
            info(`found ${reportPaths.length} report(s) to merge`);
            const proms = [];
            for (const reportPath of reportPaths) {
                info(`loading report ${reportPath}...`);
                proms.push(loadReport(reportPath));
            }
            Promise.all(proms).then((reportsAsJSON) => {
                const mergedReportAsJSON = createReportAsJSON(reportsAsJSON);
                writeMergedReport(outputPath, mergedReportAsJSON)
                    .then(resolve)
                    .catch(reject);
            }).catch(reject);
        } else {
            info('no reports found');
            resolve('no reports found');
        }
    });
};


/**
 * Merge all SonarQube XML reports into a single XML report.
 *
 * @see https://docs.cypress.io/api/plugins/after-run-api
 * @see https://docs.cypress.io/guides/guides/module-api#Results
 * @param {Object} results the Cypress run results
 * @param {Object} options the merge options
 * @returns {Promise} with the merged report path
 */
const mergeReports = (results, options = {}) => {
    const reportsOutputDir = optionalChaining(options, 'reportsOutputDir')
        || optionalChaining(results, 'config', 'reporterOptions', 'outputDir')
        || optionalChaining(results, 'config', 'reporterOptions', 'cypressSonarqubeReporterReporterOptions', 'outputDir')
        || DEFAULT_OUTPUT_DIR;
    const mergeOutputDir = optionalChaining(options, 'mergeOutputDir')
        || optionalChaining(results, 'config', 'reporterOptions', 'mergeOutputDir')
        || optionalChaining(results, 'config', 'reporterOptions', 'cypressSonarqubeReporterReporterOptions', 'mergeOutputDir')
        || reportsOutputDir;
    const mergeFileName = optionalChaining(options, 'mergeFileName')
        || optionalChaining(results, 'config', 'reporterOptions', 'mergeFileName')
        || optionalChaining(results, 'config', 'reporterOptions', 'cypressSonarqubeReporterReporterOptions', 'mergeFileName')
        || DEFAULT_MERGED_FILE_NAME;
    const reportsOutputPath = path.resolve(reportsOutputDir);
    const mergeOutputPath = path.resolve(mergeOutputDir);
    const mergeFilePath = path.resolve(mergeOutputPath, mergeFileName);
    info(`merging all sonarqube reports from ${reportsOutputPath}...`);

    return new Promise((resolve, reject) => {
        if (fse.existsSync(mergeFilePath)) {
            fse.unlinkSync(mergeFilePath);
        }
        readdirp.promise(reportsOutputPath, {
            fileFilter: ['!*.all.xml', '*.xml'],
            type: 'files',
            depth: 100
        }).then((reports) => {
            mergeReportFiles(mergeFilePath, reports.map((file) => file.fullPath))
                .then(resolve)
                .catch(reject);
        }).catch(reject);
    });
};

module.exports = mergeReports;
