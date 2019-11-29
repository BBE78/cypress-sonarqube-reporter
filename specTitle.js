const specTitle = (title) => {
    return `${title} [@spec: ${Cypress.spec.relative}]`;
};

module.exports = specTitle;
