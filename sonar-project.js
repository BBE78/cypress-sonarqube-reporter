
const sonarqubeScanner = require("sonarqube-scanner");

sonarqubeScanner({
    options: {
        "sonar.sources": ".",
        "sonar.sourceEncoding": "utf-8",
        "sonar.eslint.reportPaths": "dist/eslint-report.json"
    }
}, () => {});
