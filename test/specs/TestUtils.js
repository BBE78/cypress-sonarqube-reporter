
const fse = require("fs-extra");
const parser = require("fast-xml-parser");


const createFile = (path, content) => {
    fse.outputFileSync(path, content, { encoding: "utf8" });
}

const readFile = (path) => {
    return fse.readFileSync(path, { encoding: "utf8" });
}

const cleanOuputDir = (dir) => {
    fse.rmdirSync(dir, { recursive: true });
};

const verifyReportExists = (path) => {
    expect(fse.existsSync(path)).toBeTruthy();
};

const verifyGeneratedReport = (path, separator, fullTitle) => {
    const titleSeparator = separator || " - ";
    const useFullTitle = (fullTitle !== undefined) ? fullTitle : true;
    const xml = fse.readFileSync(path, { encoding: "utf8" });
    const json = parser.parse(xml, {
        ignoreAttributes: false,
        parseAttributeValue: true,
        attributeNamePrefix: "_",
        textNodeName: "text"
    });

    expect(json).toBeDefined();
    expect(json.testExecutions).toBeDefined();
    expect(json.testExecutions._version).toBe(1);
    expect(json.testExecutions.file).toBeDefined();
    expect(json.testExecutions.file._path).toBe("test/cypress/integration/Sample.spec.js");
    expect(json.testExecutions.file.testCase).toBeDefined();
    expect(json.testExecutions.file.testCase).toBeArray();
    expect(json.testExecutions.file.testCase).toBeArrayOfSize(5);

    let i = -1;
    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle ? `The root suite${titleSeparator}Test case #1 (must pass)` : "Test case #1 (must pass)");
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle ? `The root suite${titleSeparator}A sub suite${titleSeparator}Test case #2 (must pass)` : "Test case #2 (must pass)");
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle ? `The root suite${titleSeparator}A sub suite${titleSeparator}Test case #3 (must fail)` : "Test case #3 (must fail)");
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);
    expect(json.testExecutions.file.testCase[i].failure).toBeDefined();
    expect(json.testExecutions.file.testCase[i].failure._message).toBe("AssertionError: expected true to be false");
    expect(json.testExecutions.file.testCase[i].failure.text).toStartWith("AssertionError: expected true to be false");
    expect(json.testExecutions.file.testCase[i].failure.text).toIncludeMultiple([ " at " ]);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle ? `The root suite${titleSeparator}Another sub suite${titleSeparator}Test case #4 (must be skipped)` : "Test case #4 (must be skipped)");
    expect(json.testExecutions.file.testCase[i]._duration).toBe(0);
    expect(json.testExecutions.file.testCase[i].skipped).toBeDefined();
    expect(json.testExecutions.file.testCase[i].skipped._message).toBe("skipped test");

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle ? `The root suite${titleSeparator}Another sub suite${titleSeparator}Test case #5 (must raise an error)` : "Test case #5 (must raise an error)");
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);
    expect(json.testExecutions.file.testCase[i].error).toBeDefined();
    expect(json.testExecutions.file.testCase[i].error._message).toBe("TypeError: Cannot read property 'toString' of undefined");
    expect(json.testExecutions.file.testCase[i].error.text).toStartWith("TypeError: Cannot read property 'toString' of undefined");
    expect(json.testExecutions.file.testCase[i].error.text).toIncludeMultiple([ " at " ]);
};

module.exports = {
    cleanOuputDir,
    createFile,
    readFile,
    verifyReportExists,
    verifyGeneratedReport
};
