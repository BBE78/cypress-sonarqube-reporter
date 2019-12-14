
const specTitle = require("../../specTitle");

describe("Testing specTitle.js", () => {

    describe("with Cypress defined", () => {

        beforeEach(() => {
            global.Cypress = {
                spec: {
                    relative: "test/Sample.spec.js"
                }
            };
        });

        afterEach(() => {
            delete global.Cypress;
        });

        test("nominal", () => {
            const result = specTitle("My title");
            expect(result).toBe("My title [@spec: test/Sample.spec.js]");
        });

        test("with undefined", () => {
            const result = specTitle();
            expect(result).toBeUndefined();
        });

    });

    describe("without Cypress", () => {

        beforeEach(() => {
            delete global.Cypress;
        });

        test("without Cypress defined", () => {
            expect(() => {
                specTitle("My title");
            }).toThrowError("Cypress is not defined");
        });

        test("without Cypress.spec defined", () => {
            global.Cypress = {};
            expect(() => {
                specTitle("My title");
            }).toThrowError("Cypress.spec is not defined, Cypress = {}");
        });

        test("without Cypress.spec.relative defined", () => {
            global.Cypress = {
                spec: {}
            };
            expect(() => {
                specTitle("My title");
            }).toThrowError("Cypress.spec.relative is not defined, Cypress.spec = {}");
        });

    });

});
