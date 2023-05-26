// Literally copy-pasted from ChatGPT
const { execSync } = require('child_process');

// List of test files to execute individually
const testFiles = [
    'test/card.test.js',
    'test/functions.test.js',
    'test/game.test.js',
];

// Execute each test file individually
testFiles.forEach((testFile) => {
    try {
        execSync(`npx mocha ${testFile}`, { stdio: 'inherit' });
    } catch (error) {
        process.exitCode = 1;
    }
});
