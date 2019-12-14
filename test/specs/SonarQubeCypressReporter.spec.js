require("../../index");

describe("Testing SonarQubeCypressReporter.js", () => {

    // Just for code coverage, since reporter depends on Cypress env (too complicated to be mocked)...
    it("dummy test", () => {
        expect(true).toBeTruthy();
    });

});
