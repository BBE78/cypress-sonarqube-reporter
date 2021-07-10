const _formatVar = (value) => {
    return JSON.stringify(value, null, '    ');
};

const _specTitleFromSpec = (title, spec) => {

    if (!spec.relative) {
        throw new Error(`Cypress.spec.relative is not defined, Cypress.spec = ${_formatVar(spec)}`);
    }

    if (!spec.absolute) {
        throw new Error(`Cypress.spec.absolute is not defined, Cypress.spec = ${_formatVar(spec)}`);
    }

    return `${title} [@spec: ${JSON.stringify(spec)}]`;
};

const specTitle = (title) => {
    if (title) {
        if (Cypress) {
            if (Cypress.spec) {
                return _specTitleFromSpec(title, Cypress.spec);
            } else {
                throw new Error(`Cypress.spec is not defined, Cypress = ${_formatVar(Cypress)}`);
            }
        } else {
            throw new Error('Cypress is not defined');
        }
    } else {
        return title;
    }
};

module.exports = specTitle;
