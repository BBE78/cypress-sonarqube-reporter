
const specTitle = require('cypress-sonarqube-reporter/specTitle');


describe(specTitle(('Test Suite #2')), () => {

    before(() => {
        cy.visit('/');
    });

    it('Edit (should pass)', () => {
        cy.get('#root div.App header.App-header p').contains('Edit');
    });

});
