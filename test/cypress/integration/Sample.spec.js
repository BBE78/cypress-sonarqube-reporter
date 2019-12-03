
const specTitle = require("../../../specTitle");

describe(specTitle("The root suite"), () => {

    it("Test case #1 (must pass)", () => {
        expect(true).to.be.true;
    });

    describe("A sub suite", () => {

        it("Test case #2 (must pass)", () => {
            expect(true).to.be.true;
        });

        it("Test case #3 (must fail)", () => {
            expect(true).to.be.false;
        });

    });

    describe("Another sub suite", () => {

        xit("Test case #4 (must be skipped)", () => {
            expect(true).to.be.false;
        });

        it("Test case #5 (must raise an error)", () => {
            undefined.toString();
        });

    });

});
