
const specTitle = (title) => {
    if (title) {
        if (Cypress) {
            if (Cypress.spec) {
                if (Cypress.spec.relative) {
                    return `${title} [@spec: ${Cypress.spec.relative}]`;
                } else {
                    throw `Cypress.spec.relative is not defined, Cypress.spec = ${JSON.stringify(Cypress.spec, null, 4)}`;
                }
            } else {
                throw `Cypress.spec is not defined, Cypress = ${JSON.stringify(Cypress, null, 4)}`;
            }
        } else {
            throw "Cypress is not defined";
        }
    } else {
        return title;
    }
};

module.exports = specTitle;
