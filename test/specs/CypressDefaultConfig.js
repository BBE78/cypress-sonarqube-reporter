
module.exports = {
    quiet: true,
    configFile: false,
    config: {
        integrationFolder: 'test/cypress/integration',
        fixturesFolder: 'test/cypress/fixtures',
        pluginsFile: 'test/cypress/plugins/index.js',
        supportFile: 'test/cypress/support/index.js',
        screenshotsFolder: 'dist/cypress/screenshots',
        videosFolder: 'dist/cypress/videos',
        video: false,
        screenshotOnRunFailure: false,
        trashAssetsBeforeRuns: false,
        testFiles: '**/Sample.spec.js'
    },
    reporter: '../index.js',
};
