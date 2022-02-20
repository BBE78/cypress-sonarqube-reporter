const fse = require('fs-extra');
const pkg = require('./package.json');


const generateSonarProject = (options) => {
    const data = Object.entries(options).map(([key, value]) => `${key} = ${value}`).join('\n');
    fse.writeFile('./sonar-project.properties', data, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        } else {
            console.info('SonarQube project file successfully generated');
        }
    });
};


generateSonarProject({
    'sonar.projectKey': 'BBE78_cypress-sonarqube-reporter',
    'sonar.organization': 'bbe78',
    'sonar.projectName': pkg.name,
    'sonar.projectDescription': pkg.description,
    'sonar.projectVersion': pkg.version,
    'sonar.links.homepage': 'https://github.com/BBE78/cypress-sonarqube-reporter',
    'sonar.links.ci': 'https://github.com/BBE78/cypress-sonarqube-reporter/actions/workflows/ci.yml',
    'sonar.links.issue': 'https://github.com/BBE78/cypress-sonarqube-reporter/issues',
    'sonar.sourceEncoding': 'UTF-8',
    'sonar.sources': './src',
    'sonar.tests': './test',
    'sonar.javascript.lcov.reportPaths': './dist/reports/coverage/lcov.info',
    'sonar.eslint.reportPaths': './dist/reports/eslint-report.json'
});
