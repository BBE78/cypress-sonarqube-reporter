
const specTitle = require("../../../specTitle");

describe(specTitle("Another root suite"), () => {

    it("Test case #1 (must pass)", () => {
        expect(true).to.be.true;
    });

});
