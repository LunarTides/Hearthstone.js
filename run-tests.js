// Literally copy-pasted from ChatGPT
const { execSync } = require('child_process');
const fs = require('fs');

// List of test files to execute individually
const testFiles = fs.readdirSync(__dirname + '/test/');

// Execute each test file individually
testFiles.forEach(testFile => {
    try {
        execSync(`npx mocha ${testFile}`, { stdio: 'inherit' });
    } catch (error) {
        process.exitCode = 1;
    }
});