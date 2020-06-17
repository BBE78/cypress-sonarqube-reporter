
const specTitle = (title) => {
    if (title) {
        if (Cypress) {
            if (Cypress.spec) {

                if (!Cypress.spec.relative) {
                    throw `Cypress.spec.relative is not defined, Cypress.spec = ${JSON.stringify(Cypress.spec, null, 4)}`;
                }

                if (!Cypress.spec.absolute) {
                    throw `Cypress.spec.absolute is not defined, Cypress.spec = ${JSON.stringify(Cypress.spec, null, 4)}`;
                }

                return `${title} [@spec: ${JSON.stringify(Cypress.spec)}]`;
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
