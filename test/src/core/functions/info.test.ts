import { format } from 'node:util';
import { expect, describe, test } from 'bun:test';
import { createGame, infoFunctions } from '@Game/internal.js';

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
createGame();

describe('src/core/functions/info', () => {
    test('version', async () => {
        const { info } = game.config;

        expect(infoFunctions.version(1)).toEqual(format('%s', info.version));
        expect(infoFunctions.version(2)).toEqual(format('%s-%s', info.version, info.branch));

        // If the build is 0, we don't want to show it
        info.build = 0;
        expect(infoFunctions.version(3)).toEqual(format('%s-%s', info.version, info.branch));
        expect(infoFunctions.version(4)).toEqual(format('%s-%s (%s)', info.version, info.branch, infoFunctions.latestCommit()));

        info.build = 1;
        expect(infoFunctions.version(3)).toEqual(format('%s-%s.%s', info.version, info.branch, info.build));
        expect(infoFunctions.version(4)).toEqual(format('%s-%s.%s (%s)', info.version, info.branch, info.build, infoFunctions.latestCommit()));

        expect(infoFunctions.version.bind(infoFunctions, 5)).toThrow('Invalid detail amount');
    });

    test('latestCommit', async () => {
        let latestCommit: string | undefined;

        try {
            latestCommit = game.functions.util.runCommand('git rev-parse --short=7 HEAD').trim();
        } catch {
            return;
        }

        expect(infoFunctions.latestCommit()).toEqual(latestCommit);
        expect(game.cache.latestCommitHash).toEqual(latestCommit);
    });
});
