
const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
    token: '7eed336209600041e091f6ce4c292257a9bedde3',
    options: {
        'sonar.sources': 'src',
        'sonar.tests': 'test',
        'sonar.sourceEncoding': 'utf-8',
        'sonar.eslint.reportPaths': 'dist/reports/eslint-report.json',
        'sonar.javascript.lcov.reportPaths': 'dist/reports/coverage/lcov.info'
    }
});
