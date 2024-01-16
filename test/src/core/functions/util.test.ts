import { expect, describe, test } from 'bun:test';
import { Card, createGame, utilFunctions } from '@Game/internal.js';

/*
 * Need to create a game in case the functions need it
 * This is a pretty big performance hit.
 */
createGame();

describe('src/core/functions/util', () => {
    test('remove', async () => {
        const list = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];

        utilFunctions.remove(list, 3);

        expect(list).toEqual([1, 1, 2, 2, 3, 4, 4, 5, 5]);
    });

    test('createWall', async () => {
        const bricks = [];
        bricks.push(
            'Example - Example',
            'Test - Hello World',
            'This is the longest - Short',
            'Tiny - This is even longer then that one!',
        );

        const wall = utilFunctions.createWall(bricks, '-');

        expect(wall).toEqual([
            'Example             - Example',
            'Test                - Hello World',
            'This is the longest - Short',
            'Tiny                - This is even longer then that one!',
        ]);
    });

    test.todo('importConfig', async () => {
        expect(false).toEqual(true);
    });

    test.todo('createLogFile', async () => {
        expect(false).toEqual(true);
    });

    test.todo('parseLogFile', async () => {
        expect(false).toEqual(true);
    });

    test.todo('runCommand', async () => {
        expect(false).toEqual(true);
    });

    test.todo('tryCompile', async () => {
        expect(false).toEqual(true);
    });

    test.todo('runCommandAsChildProcess', async () => {
        expect(false).toEqual(true);
    });

    test.todo('openInBrowser', async () => {
        expect(false).toEqual(true);
    });

    test.todo('getTraditionalTurnCounter', async () => {
        expect(false).toEqual(true);
    });

    test.todo('getPlayerFromId', async () => {
        expect(false).toEqual(true);
    });

    test.todo('fs', async () => {
        expect(false).toEqual(true);
    });

    test.todo('searchCardsFilder', async () => {
        expect(false).toEqual(true);
    });

    test.todo('restrictPath', async () => {
        expect(false).toEqual(true);
    });

    test.todo('dirname', async () => {
        expect(false).toEqual(true);
    });

    test.todo('getRandomTarget', async () => {
        expect(false).toEqual(true);
    });






    test.todo('dirname', async () => {
        // I don't know how to test this
        expect(false).toEqual(true);
    });

    test.todo('getRandomTarget', async () => {
        expect(false).toEqual(true);
    });
});
