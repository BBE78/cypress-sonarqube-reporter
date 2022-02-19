/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {

    // https://docs.cypress.io/api/plugins/after-run-api
    on('after:run', (results) => {
		// /!\ don't forget to return the Promise /!\
        return require('cypress-sonarqube-reporter/mergeReports')(results);
    });

    require('@cypress/code-coverage/task')(on, config);

    return config;
};
