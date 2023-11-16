const fse = require('fs-extra');
const parser = require('fast-xml-parser');
const { resolve } = require('path');
const rimraf = require('rimraf');


const createFile = (reportPath, content) => {
    fse.outputFileSync(reportPath, content, { encoding: 'utf8' });
}


const readFile = (reportPath) => {
    return fse.readFileSync(reportPath, { encoding: 'utf8' });
}


const cleanOuputDir = (dir) => {
    rimraf.sync(dir);
};


const overwriteConfig = (defaultConfig, config) => {
    return Object.assign({}, defaultConfig, config);
};


const verifyReportExists = (reportPath) => {
    expect(fse.existsSync(reportPath)).toBeTruthy();
};

const verifyReportDoesNotExist = (reportPath) => {
    expect(fse.existsSync(reportPath)).toBeFalsy();
};


const verifyGeneratedReport = (reportPath, options, specFileName = 'Sample.spec.js', cypressVersionGreaterThan10 = false, isComponentTest = false) => {
    const titleSeparator = options?.titleSeparator ?? ' - ';
    const useFullTitle = (options && options.useFullTitle === false) ? false : true;
    const xml = fse.readFileSync(reportPath, { encoding: 'utf8' });
    const json = parser.parse(xml, {
        ignoreAttributes: false,
        parseAttributeValue: true,
        attributeNamePrefix: '_',
        textNodeName: 'text'
    });

    expect(json).toBeDefined();
    expect(json.testExecutions).toBeDefined();
    expect(json.testExecutions._version).toBe(1);
    expect(json.testExecutions.file).toBeDefined();
    expect(json.testExecutions.file._path).toBe(
        isComponentTest
            ? `test/cypress/component/${specFileName}`
            : (options?.useAbsoluteSpecPath
                ? resolve(`test/cypress/integration/${specFileName}`).replace(/\\/g, '/')   // force path separator to unix style for better readability
                : cypressVersionGreaterThan10
                    ? `../cypress/integration/${specFileName}`
                    : `test/cypress/integration/${specFileName}`));
    expect(json.testExecutions.file.testCase).toBeDefined();
    expect(json.testExecutions.file.testCase).toBeArray();
    expect(json.testExecutions.file.testCase).toBeArrayOfSize(6);

    let i = -1;
    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}Test case #1 (must pass)`
        : 'Test case #1 (must pass)');
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}A sub suite${titleSeparator}Test case #2 (must pass)`
        : 'Test case #2 (must pass)');
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}A sub suite${titleSeparator}Test case #3 (must fail)`
        : 'Test case #3 (must fail)');
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);
    expect(json.testExecutions.file.testCase[i].failure).toBeDefined();
    expect(json.testExecutions.file.testCase[i].failure._message).toBe('AssertionError: expected true to be false');
    expect(json.testExecutions.file.testCase[i].failure.text).toStartWith('AssertionError: expected true to be false');
    expect(json.testExecutions.file.testCase[i].failure.text).toIncludeMultiple([ ' at ' ]);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}Another sub suite${titleSeparator}Test case #4 (must be skipped)`
        : 'Test case #4 (must be skipped)');
    expect(json.testExecutions.file.testCase[i]._duration).toBe(0);
    expect(json.testExecutions.file.testCase[i].skipped).toBeDefined();
    expect(json.testExecutions.file.testCase[i].skipped._message).toBe('skipped test');

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}Another sub suite${titleSeparator}Test case #5 (must raise an error)`
        : 'Test case #5 (must raise an error)');
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);
    expect(json.testExecutions.file.testCase[i].error).toBeDefined();
    expect(json.testExecutions.file.testCase[i].error._message).toStartWith('TypeError: Cannot read propert');
    expect(json.testExecutions.file.testCase[i].error._message).toInclude('\'toString\'');
    expect(json.testExecutions.file.testCase[i].error._message).toInclude('undefined');
    expect(json.testExecutions.file.testCase[i].error.text).toStartWith('TypeError: Cannot read propert');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude('\'toString\'');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude('undefined');
    expect(json.testExecutions.file.testCase[i].error.text).toIncludeMultiple([ ' at ' ]);

    expect(json.testExecutions.file.testCase[++i]).toBeDefined();
    expect(json.testExecutions.file.testCase[i]._name).toBe(useFullTitle
        ? `The root suite${titleSeparator}A suite with a failed before hook${titleSeparator}Test case #6 (must be skipped because of failed before hook)`
        : 'Test case #6 (must be skipped because of failed before hook)');
    expect(json.testExecutions.file.testCase[i]._duration).toBeGreaterThanOrEqual(0);
    //expect(json.testExecutions.file.testCase[i].skipped).toBeDefined();
    //expect(json.testExecutions.file.testCase[i].skipped._message).toBe('An error occurred during a hook and remaining tests in the current suite are skipped');
    expect(json.testExecutions.file.testCase[i].error).toBeDefined();
    expect(json.testExecutions.file.testCase[i].error._message).toStartWith('TypeError: Cannot read propert');
    expect(json.testExecutions.file.testCase[i].error._message).toInclude('\'toString\'');
    expect(json.testExecutions.file.testCase[i].error._message).toInclude('undefined');
    expect(json.testExecutions.file.testCase[i].error.text).toStartWith('TypeError: Cannot read propert');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude('\'toString\'');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude('undefined');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude('Because this error occurred during a `before');
    expect(json.testExecutions.file.testCase[i].error.text).toInclude(' at ');
};


const verifyReport = (reportPath, config, specFileName, cypressVersionGreaterThan10 = false, isComponentTest = false) => {
    verifyReportExists(reportPath);
    verifyGeneratedReport(reportPath, config ? config.reporterOptions : undefined, specFileName, cypressVersionGreaterThan10, isComponentTest);
};


module.exports = {
    cleanOuputDir,
    createFile,
    overwriteConfig,
    readFile,
    verifyReportExists,
    verifyReportDoesNotExist,
    verifyGeneratedReport,
    verifyReport
};
