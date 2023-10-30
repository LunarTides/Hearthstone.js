import * as lib from './lib.js';

// Check if your git is clean
const GIT_STATUS = game.functions.util.runCommand('git status --porcelain');
if (typeof GIT_STATUS === 'string') {
    game.logError('<yellow>WARNING: You have uncommitted changes. Please commit them before running a non-safe command.</yellow>');
    // Process.exit(1);
}

game.logError('<yellow>WARNING: Be careful with this script. This might break things that are dependent on ids remaining the same, like deckcodes.</yellow>');
game.log('<green>The validate and quit commands are safe to use without issue.</green>');

type Commands = 'i' | 'd' | 'v' | 'q';

let func = game.input('\nWhat do you want to do? ([i]ncrement, [d]ecrement, [v]alidate, [q]uit): ')[0] as Commands;
if (!func) {
    // TODO: Maybe don't throw errors here
    throw new Error('Invalid command');
}

func = func.toLowerCase() as Commands;
const DESTRUCTIVE = ['i', 'd'] as Commands[];

if (DESTRUCTIVE.includes(func)) {
    game.logError('<yellow>WARNING: This is a destructive action. Be careful.</yellow>\n');
}

let startId: number;

switch (func) {
    case 'i': {
        startId = Number(game.input('What id to start at: '));
        if (!startId) {
            throw new Error('Invalid start id');
        }

        lib.increment(startId, true);
        break;
    }

    case 'd': {
        startId = Number(game.input('What id to start at: '));
        if (!startId) {
            throw new Error('Invalid start id');
        }

        lib.decrement(startId, true);
        break;
    }

    case 'v': {
        lib.validate(true);
        break;
    }

    case 'q': {
        break;
    }

    default: {
        throw new Error('Invalid command');
    }
}

game.log('Done');
