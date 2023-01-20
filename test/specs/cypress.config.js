const { defineConfig } = require('cypress');

module.exports = defineConfig({
    reporter: '../index.js',
    e2e: {
        fixturesFolder: false,
        screenshotOnRunFailure: false,
        screenshotsFolder: 'dist/cypress/screenshots',
        specPattern: './test/cypress/integration/**/*.spec.{js,jsx,ts,tsx}',
        supportFile: false,
        trashAssetsBeforeRuns: false,
        video: false,
        videosFolder: 'dist/cypress/videos'
    }
});
