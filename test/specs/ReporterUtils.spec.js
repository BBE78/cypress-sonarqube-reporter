/* eslint jest/expect-expect: ['error', { 'assertFunctionNames': ['expect', 'verifyReportExists'] }] */

const xmlbuilder = require('xmlbuilder');
const {
    cleanOuputDir,
    createFile,
    readFile,
    verifyReportExists
} = require('./TestUtils');
const {
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    formatTestTitle,
    formatSuiteTitle,
    writeFile
} = require('../../src/ReporterUtils');


describe('Testing ReporterUtils.js', () => {

    describe('formatTestTitle()', () => {

        it('simple test', () => {
            const result = formatTestTitle({
                title: 'My title'
            }, {
                useFullTitle: true
            });
            expect(result).toBe('My title');
        });

        it('within a suite', () => {
            const result = formatTestTitle({
                title: 'My title',
                parent: {
                    title: 'My suite'
                }
            }, {
                useFullTitle: true,
                titleSeparator: ' | '
            });
            expect(result).toBe('My suite | My title');
        });

    });

    describe('formatSuiteTitle()', () => {

        it('simple suite', () => {
            const result = formatSuiteTitle({
                title: 'My suite'
            }, {
                useFullTitle: true
            });
            expect(result).toBe('My suite');
        });

        it('within a suite', () => {
            const result = formatSuiteTitle({
                title: 'My suite',
                parent: {
                    title: 'My parent suite'
                }
            }, {
                useFullTitle: true,
                titleSeparator: ' --> '
            });
            expect(result).toBe('My parent suite --> My suite');
        });

        it('within a suite with empty title', () => {
            const result = formatSuiteTitle({
                title: 'My suite',
                parent: {
                    title: ''
                }
            }, {
                useFullTitle: true,
                titleSeparator: ' --> '
            });
            expect(result).toBe('My suite');
        });

    });

    describe('extractSpecFromSuite()', () => {

        it('nominal', () => {
            const result = extractSpecFromSuite({
                title: 'My title [@spec: {"relative":"test/Sample.spec.js","absolute":"/builds/group/project/test/Sample.spec.js"}]'
            }, {
                useAbsoluteSpecPath: false
            });
            expect(result).toBe('test/Sample.spec.js');
        });

        it('with absolute spec file option', () => {
            const result = extractSpecFromSuite({
                title: 'My title [@spec: {"relative":"test/Sample.spec.js","absolute":"/builds/group/project/test/Sample.spec.js"}]'
            }, {
                useAbsoluteSpecPath: true
            });
            expect(result).toBe('/builds/group/project/test/Sample.spec.js');
        });

        it('with file only in parent', () => {
            const result = extractSpecFromSuite({
                parent: {
                    file: 'test/Sample.spec.js'
                }
            }, {});
            expect(result).toBe('test/Sample.spec.js');
        });

        it('with spec in title', () => {
            expect(() => {
                extractSpecFromSuite({
                    title: 'My title'
                }, {
                    useAbsoluteSpecPath: false
                });
            }).toThrowError('could not find spec filename from title: My title');
        });

    });

    describe('extractTitleFromSuite()', () => {

        it('nominal', () => {
            const result = extractTitleFromSuite({
                title: 'My title [@spec: {"relative":"test/Sample.spec.js","absolute":"/builds/group/project/test/Sample.spec.js"}]'
            });
            expect(result).toBe('My title');
        });

        it('without spec in title', () => {
            const result = extractTitleFromSuite({
                title: 'My title'
            });
            expect(result).toBe('My title');
        });

    });

    describe('formatTest()', () => {

        let node;

        beforeEach(() => {
            node = xmlbuilder.create('root');
        });

        it('passed test', () => {
            formatTest(node, {
                title: 'My test',
                state: 'passed',
                duration: 123
            }, {
                useFullTitle: true
            });
            const result = node.end();
            expect(result).toBe('<?xml version="1.0"?><root><testCase name="My test" duration="123"/></root>');
        });

        it('pending test', () => {
            formatTest(node, {
                title: 'My test',
                state: 'pending',
                duration: 123
            }, {
                useFullTitle: true
            });
            const result = node.end();
            expect(result).toBe('<?xml version="1.0"?><root><testCase name="My test" duration="123"><skipped message="skipped test"/></testCase></root>');
        });

        it('skipped test', () => {
            formatTest(node, {
                title: 'My test',
                state: 'skipped',
                duration: 123
            }, {
                useFullTitle: true
            });
            const result = node.end();
            expect(result).toBe('<?xml version="1.0"?><root><testCase name="My test" duration="123"><skipped message="An error occurred during a hook and remaining tests in the current suite are skipped"/></testCase></root>');
        });

        it('failed test', () => {
            formatTest(node, {
                title: 'My test',
                state: 'failed',
                duration: 123,
                err: {
                    name: 'AssertionError',
                    message: 'the error',
                    stack: 'the full stack here'
                }
            }, {
                useFullTitle: true
            });
            const result = node.end();
            expect(result).toBe('<?xml version="1.0"?><root><testCase name="My test" duration="123"><failure message="AssertionError: the error"><![CDATA[the full stack here]]></failure></testCase></root>');
        });

        it('error test', () => {
            formatTest(node, {
                title: 'My test',
                state: 'failed',
                duration: 123,
                err: {
                    name: 'SomethingElseError',
                    message: 'the error',
                    stack: 'the full stack here'
                }
            }, {
                useFullTitle: true
            });
            const result = node.end();
            expect(result).toBe('<?xml version="1.0"?><root><testCase name="My test" duration="123"><error message="SomethingElseError: the error"><![CDATA[the full stack here]]></error></testCase></root>');
        });

        it('unknown test state', () => {
            expect(() => {
                formatTest(node, {
                    title: 'My test',
                    state: 'something'
                }, {
                    useFullTitle: true
                });
            }).toThrowError('unknown test state: something');
        });

    });

    describe('writeFile()', () => {

        const outputDir = 'dist/test';
        const specFile = 'temp/Sample.spec.js';
        const path = `${outputDir}/${specFile}.xml`;

        beforeEach(() => {
            cleanOuputDir(outputDir);
            createFile(path, 'should not be overwritten');
        });

        it('nominal', () => {
            writeFile(specFile, 'hello world', {
                outputDir: outputDir,
                prefix: '',
                preserveSpecsDir: true,
                overwrite: true
            });
            verifyReportExists(path);
            const data = readFile(path);
            expect(data).toBe('hello world');
        });

        it('with option(s): overwrite=false', () => {
            try {
                writeFile(specFile, 'hello world', {
                    outputDir: outputDir,
                    prefix: '',
                    preserveSpecsDir: true,
                    overwrite: false
                });
                expect(true).toBe(false);
            } catch (error) {
                verifyReportExists(path);
                const data = readFile(path);
                // eslint-disable-next-line jest/no-try-expect
                expect(data).toBe('should not be overwritten');
            }
        });

    });

});
