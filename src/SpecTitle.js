
const specTitle = (title) => {
    if (title) {
        if (Cypress) {
            if (Cypress.spec) {

                let specRelative;
                let specAbsolute;

                if (Cypress.spec.relative) {
                    specRelative = `[@specRelative: ${Cypress.spec.relative}]`;
                } else {
                    throw `Cypress.spec.relative is not defined, Cypress.spec = ${JSON.stringify(Cypress.spec, null, 4)}`;
                }

                if (Cypress.spec.absolute) {
                    specAbsolute = `[@specAbsolute: ${Cypress.spec.absolute}]`;
                } else {
                    throw `Cypress.spec.absolute is not defined, Cypress.spec = ${JSON.stringify(Cypress.spec, null, 4)}`;
                }

                return `${title} ${specRelative} ${specAbsolute}`;
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
