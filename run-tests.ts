// Partially copy-pasted from ChatGPT
import { execSync } from 'child_process';
import fs from 'fs';

// List of test files to execute individually
const testFiles = fs.readdirSync(__dirname + '/test/');

// Execute each test file individually
testFiles.forEach(testFile => {
    try {
        execSync(`npx mocha test/${testFile} --no-warnings`, { stdio: 'inherit' });
    } catch (error) {
        process.exitCode = 1;
    }
});
