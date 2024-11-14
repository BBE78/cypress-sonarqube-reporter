const fse = require('fs-extra');
const path = require('path');
const mergeReports = require('../../mergeReports');

const DEFAULT_MERGED_REPORT_FILENAME = 'cypress-sonarqube-reports.all.xml';
const NO_REPORTS_FOUND = 'no reports found';
const REPORTS_DIR = 'dist/test/merge/data';


const copyTestData = () => {
    if (!fse.existsSync(REPORTS_DIR)) {
        fse.copySync('test/data', REPORTS_DIR);
    }
};


const checkXmlContent = (fileName, parentDir = REPORTS_DIR) => {
    const filePath = path.resolve(parentDir, fileName);
    expect(fse.existsSync(filePath)).toBeTrue();
    const content = fse.readFileSync(filePath, 'utf-8').trim();
    expect(content).toStartWith('<?xml version=');
    expect(content).toEndWith('</testExecutions>');
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
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR
                    }
                }
            }).then((result) => {
                expect(result).toMatch(DEFAULT_MERGED_REPORT_FILENAME);
                checkXmlContent(result);
            });
        });

        test('with Cypress mergeOutputDir', () => {
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'dist/test/merge'
                    }
                }
            }).then((result) => {
                expect(result).toMatch('merge');
                checkXmlContent(DEFAULT_MERGED_REPORT_FILENAME, 'dist/test/merge');
            });
        });

        test('with Cypress mergeFileName', () => {
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'dist/test/merge',
                        mergeFileName: 'another.xml'
                    }
                }
            }).then((result) => {
                expect(result).toMatch('another.xml');
                checkXmlContent(result, 'dist/test/merge');
            });
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
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: 'fake'
                    }
                }
            }, {
                reportsOutputDir: REPORTS_DIR
            }).then((result) => {
                expect(result).toMatch(DEFAULT_MERGED_REPORT_FILENAME);
                checkXmlContent(result);
            });
        });

        test('with mergeOutputDir', () => {
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeOutputDir: 'fake'
                    }
                }
            }, {
                mergeOutputDir: 'dist/test/merge-another'
            }).then((result) => {
                expect(result).toMatch('merge-another');
                checkXmlContent(DEFAULT_MERGED_REPORT_FILENAME, 'dist/test/merge-another');
            });
        });

        test('with mergeFileName', () => {
            return mergeReports({
                config: {
                    reporterOptions: {
                        outputDir: REPORTS_DIR,
                        mergeFileName: 'fake'
                    }
                }
            }, {
                mergeFileName: 'another-options.xml'
            }).then((result) => {
                expect(result).toMatch('another-options.xml');
                checkXmlContent(result);
            });
        });

    });

});
