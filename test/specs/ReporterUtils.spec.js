/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "verifyReportExists"] }] */

const xmlbuilder = require("xmlbuilder");
const {
    cleanOuputDir,
    createFile,
    readFile,
    verifyReportExists
} = require("./TestUtils");
const {
    extractSpecFromSuite,
    extractTitleFromSuite,
    formatTest,
    formatTestTitle,
    formatSuiteTitle,
    writeFile
} = require("../../src/ReporterUtils");


describe("Testing ReporterUtils.js", () => {

    describe("formatTestTitle()", () => {

        it("simple test", () => {
            const result = formatTestTitle({
                title: "My title"
            }, {
                useFullTitle: true
            });
            expect(result).toBe("My title");
        });

        it("within a suite", () => {
            const result = formatTestTitle({
                title: "My title",
                parent: {
                    title: "My suite"
                }
            }, {
                useFullTitle: true,
                titleSeparator: " | "
            });
            expect(result).toBe("My suite | My title");
        });

    });

    describe("formatSuiteTitle()", () => {

        it("simple suite", () => {
            const result = formatSuiteTitle({
                title: "My suite"
            }, {
                useFullTitle: true
            });
            expect(result).toBe("My suite");
        });

        it("within a suite", () => {
            const result = formatSuiteTitle({
                title: "My suite",
                parent: {
                    title: "My parent suite"
                }
            }, {
                useFullTitle: true,
                titleSeparator: " --> "
            });
            expect(result).toBe("My parent suite --> My suite");
        });

        it("within a suite with empty title", () => {
            const result = formatSuiteTitle({
                title: "My suite",
                parent: {
                    title: ""
                }
            }, {
                useFullTitle: true,
                titleSeparator: " --> "
            });
            expect(result).toBe("My suite");
        });

    });

    describe("extractSpecFromSuite()", () => {

        it("nominal", () => {
            const result = extractSpecFromSuite({
                title: "My title [@spec: test/Sample.spec.js]"
            });
            expect(result).toBe("test/Sample.spec.js");
        });

        it("without spec in title", () => {
            expect(() => {
                extractSpecFromSuite({
                    title: "My title"
                });
            }).toThrowError("could not find spec filename from title: My title");
        });

    });

    describe("extractTitleFromSuite()", () => {

        it("nominal", () => {
            const result = extractTitleFromSuite({
                title: "My title [@spec: test/Sample.spec.js]"
            });
            expect(result).toBe("My title");
        });

        it("without spec in title", () => {
            const result = extractTitleFromSuite({
                title: "My title"
            });
            expect(result).toBe("My title");
        });

    });

    describe("formatTest()", () => {

        let node;

        beforeEach(() => {
            node = xmlbuilder.create("root");
        });

        describe("passed test", () => {

            it("nominal", () => {
                formatTest(node, {
                    title: "My test",
                    state: "passed",
                    duration: 123
                }, {
                    useFullTitle: true
                });
                const result = node.end();
                expect(result).toBe("<?xml version=\"1.0\"?><root><testCase name=\"My test\" duration=\"123\"/></root>");
            });

        });

        describe("skipped test", () => {

            it("nominal", () => {
                formatTest(node, {
                    title: "My test",
                    state: "pending",
                    duration: 123
                }, {
                    useFullTitle: true
                });
                const result = node.end();
                expect(result).toBe("<?xml version=\"1.0\"?><root><testCase name=\"My test\" duration=\"123\"><skipped message=\"skipped test\"/></testCase></root>");
            });

        });

        describe("failed test", () => {

            it("nominal", () => {
                formatTest(node, {
                    title: "My test",
                    state: "failed",
                    duration: 123,
                    err: {
                        name: "AssertionError",
                        message: "the error",
                        stack: "the full stack here"
                    }
                }, {
                    useFullTitle: true
                });
                const result = node.end();
                expect(result).toBe("<?xml version=\"1.0\"?><root><testCase name=\"My test\" duration=\"123\"><failure message=\"AssertionError: the error\"><![CDATA[the full stack here]]></failure></testCase></root>");
            });

        });

        describe("error test", () => {

            it("nominal", () => {
                formatTest(node, {
                    title: "My test",
                    state: "failed",
                    duration: 123,
                    err: {
                        name: "SomethingElseError",
                        message: "the error",
                        stack: "the full stack here"
                    }
                }, {
                    useFullTitle: true
                });
                const result = node.end();
                expect(result).toBe("<?xml version=\"1.0\"?><root><testCase name=\"My test\" duration=\"123\"><error message=\"SomethingElseError: the error\"><![CDATA[the full stack here]]></error></testCase></root>");
            });

        });

        describe("unknown test state", () => {

            it("unknown", () => {
                expect(() => {
                    formatTest(node, {
                        title: "My test",
                        state: "something"
                    }, {
                        useFullTitle: true
                    });
                }).toThrowError("unknown test state: something");
            });

        });

    });

    describe("writeFile()", () => {

        const outputDir = "dist/temp";
        const specFile = "test/Sample.spec.js";
        const path = `${outputDir}/${specFile}.xml`;

        beforeEach(() => {
            cleanOuputDir(outputDir);
            createFile(path, "should not be overwritten");
        });

        it("nominal", () => {
            return writeFile(specFile, "hello world", {
                outputDir: outputDir,
                prefix: "",
                preserveSpecsDir: true,
                overwrite: true
            }).then(() => {
                verifyReportExists(path);
                const data = readFile(path);
                expect(data).toBe("hello world");
            });
        });

        it("with option(s): overwrite=false", () => {
            try {
                writeFile(specFile, "hello world", {
                    outputDir: outputDir,
                    prefix: "",
                    preserveSpecsDir: true,
                    overwrite: false
                });
                expect(true).toBe(false);
            } catch (error) {
                verifyReportExists(path);
                const data = readFile(path);
                expect(data).toBe("should not be overwritten");
            }
    });

    });

});
