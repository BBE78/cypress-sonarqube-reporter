const fse = require('fs-extra');
const mergeReports = require('../../mergeReports');

const DEFAULT_MERGED_REPORT_FILENAME = 'cypress-sonarqube-reports.all.xml';
const NO_REPORTS_FOUND = 'no reports found';
const REPORTS_DIR = 'dist/test/merge/data';


const copyTestData = () => {
    if (!fse.existsSync(REPORTS_DIR)) {
        fse.copySync('test/data', REPORTS_DIR);
    }
};


describe('Testing mergeReports.js', () => {

    describe.skip('without Cypress configuration', () => {

        test('with undefined', () => {
            return expect(mergeReports()).resolves.toBe(NO_REPORTS_FOUND);
        });

        test('without Cypress config', () => {
            return expect(mergeReports({})).resolves.toBe(NO_REPORTS_FOUND);
        });

        test('without Cypress reporterOptions', () => {
            return expect(mergeReports({
                config: {}
            })).resolves.toBe(NO_REPORTS_FOUND);
        });

        test('without Cypress outputDir', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {}
                }
            })).resolves.toBe(NO_REPORTS_FOUND);
        });

    });

    describe('with Cypress configuration', () => {

        beforeAll(copyTestData);

        test('with Cypress outputDir', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR
                    }
                }
            })).resolves.toMatch(DEFAULT_MERGED_REPORT_FILENAME);
        });

        test('with Cypress mergeOutputDir', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'dist/test/merge'
                    }
                }
            })).resolves.toMatch('merge');
        });

        test('with Cypress mergeFileName', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'dist/test/merge',
                        mergeFileName: 'another.xml'
                    }
                }
            })).resolves.toMatch('another.xml');
        });

        test('with Cypress outputDir, but empty', () => {
            const outputDir = `${REPORTS_DIR}/empty`;
            fse.mkdirSync(outputDir);
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: outputDir
                    }
                }
            })).resolves.toMatch(NO_REPORTS_FOUND);
        });

    });

    describe('with options', () => {

        beforeAll(copyTestData);

        test('with reportsOutputDir', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: 'fake'
                    }
                }
            }, {
                reportsOutputDir: REPORTS_DIR
            })).resolves.toMatch(DEFAULT_MERGED_REPORT_FILENAME);
        });

        test('with mergeOutputDir', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'fake'
                    }
                }
            }, {
                mergeOutputDir: 'dist/test/merge-options'
            })).resolves.toMatch('merge-options');
        });

        test('with mergeFileName', () => {
            return expect(mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeFileName: 'fake'
                    }
                }
            }, {
                mergeFileName: 'another-options.xml'
            })).resolves.toMatch('another-options.xml');
        });

    });

});
