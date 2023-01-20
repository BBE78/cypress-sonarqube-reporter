/// <reference types="cypress" />

describe('Test Suite #1', () => {

    before(() => {
        cy.visit('/');
    });

    it('Learn React (should pass)', () => {
        cy.get('#root div.App header.App-header a.App-link').should('have.text', 'Learn React');
    });

    it('Learn Vue (should failed)', () => {
        cy.get('#root div.App header.App-header a.App-link').should('have.text', 'Learn Vue');
    });

    it.skip('Learn Angular (should be skipped)', () => {
        cy.get('#root div.App header.App-header a.App-link').should('have.text', 'Learn Angular');
    });

});
