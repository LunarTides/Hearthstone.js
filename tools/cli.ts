import * as src from '../src/index.js'; // Source Code
import * as dc from '../tools/deckcreator.js'; // Deck Creator
import * as ccc from '../tools/cardcreator/custom.js'; // Custom Card Creator
import * as vcc from '../tools/cardcreator/vanilla.js'; // Vanilla Card Creator
import * as clc from '../tools/cardcreator/class.js'; // Class Creator
import * as cclib from '../tools/cardcreator/lib.js'; // Class Creator
import { type Blueprint } from '../src/types.js';
import { type CcType } from './cardcreator/lib.js';

export function main(userInputLoop: (prompt: string, exitCharacter: string | undefined, callback: (input: string) => any) => any): void {
    // Common card creator variant stuff
    const doCardCreatorVariant = (usedOptions: string[], args: string[], callback: (debug: boolean, overrideType?: CcType) => any): void => {
        const doDryRun = usedOptions.includes('--dry-run');
        const doCcType = usedOptions.includes('--cc-type');

        let ccType: CcType | undefined;

        // Get cctype
        if (doCcType) {
            ccType = args[0] as CcType;

            if (!ccType) {
                game.logError('<red>Invalid cc type!</red>');
                game.pause();
                return;
            }
        }

        callback(doDryRun, ccType);
    };

    // Main loop
    userInputLoop('> ', undefined, input => {
        let args = input.split(' ');
        const name = args.shift()?.toLowerCase();
        if (!name) {
            throw new Error('Name is undefined. This should never happen.');
        }

        // Options - Long, short
        const commandOptions = [
            ['--dry-run', '-n'],
            ['--cc-type', '-t'],
        ];

        // Parse args
        const usedOptions: string[] = [];

        // Clone the args. Kinda hacky.
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const parsedArguments = JSON.parse(`[${args.map(arg => `"${arg.replaceAll('"', '\'')}"`)}]`) as string[];
        for (const parsedArgument of parsedArguments) {
            // Parse -dt
            if (/^-\w\w+/.test(parsedArgument)) {
                const allArguments = [...parsedArgument];
                allArguments.shift();

                for (const argument of allArguments) {
                    const option = commandOptions.find(option => option.includes('-' + argument))?.[0];
                    if (!option) {
                        continue;
                    }

                    usedOptions.push(option);
                }

                args.shift();
                return;
            }

            // Parse -d or --dry-run
            const option = commandOptions.find(option => option.includes(parsedArgument))?.[0];
            if (!option) {
                return;
            }

            usedOptions.push(option);
            args.shift();
        }

        switch (name) {
            case 'help': {
                // Taken heavy inspiration from 'man'
                game.log('\n<bold>Commands</bold>');
                game.log('ccc           - Runs the custom card creator');
                game.log('vcc           - Runs the vanilla card creator');
                game.log('clc           - Runs the class creator');
                game.log('cclib (args)  - Uses the card creator library to manually create a card');
                game.log('dc            - Runs the deck creator');
                game.log('game          - Runs the main game');
                game.log('script (name) - Runs the specified script (NOT IMPLEMENTED!)');
                game.log();
                game.log('<bold>Options</bold>');
                game.log('    <bold>Card Creator Options (ccc, vcc, clc, cclib)</bold>');
                game.log('        <bold>-n, --dry-run</bold>\n            Don\'t actually create the card, just show what would be done.');
                game.log('        <bold>-t <underline>type</underline>, --cc-type <underline>type</bold underline>\n            Set the name of the card creator');
                game.log();
                game.log('    <bold>CCLib Options (cclib)</bold>');
                game.log('        <bold>name</bold>=<underline>name</underline><bold>');
                game.log('        <bold>stats</bold>=<underline>[attack, health]</underline><bold>');
                game.log();
                game.log('<bold>CCLib Example</bold>');
                game.log('cclib -dt Test name="Sheep" stats=[1,1] text="" cost=1 type="Minion" tribe="Beast" classes=["Neutral"] rarity="Free" uncollectible=true id=0');
                game.log('       ^^      ^            ^           ^');
                game.log('       Dry-run The name of the card     The description of the card. Etc...');
                game.log('        CC type is "Test"   The stats of the card');
                game.log();
                game.pause();

                break;
            }

            case 'ccc': {
                doCardCreatorVariant(usedOptions, args, ccc.main);

                break;
            }

            case 'vcc': {
                doCardCreatorVariant(usedOptions, args, vcc.main);

                break;
            }

            case 'clc': {
                doCardCreatorVariant(usedOptions, args, clc.main);

                break;
            }

            case 'cclib': {
                doCardCreatorVariant(usedOptions, args, (debug, overrideType) => {
                    // Here we implement our own card creator variant

                    // Only include args with an '=' in it.
                    args = args.filter(arg => arg.includes('='));

                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    const blueprint = {} as Blueprint;
                    for (const argument of args) {
                        let [key, value] = argument.split('=');

                        // Parse it as its real value instead of a string.
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value = JSON.parse(`[ ${value} ]`)[0];

                        // HACK: Use of never
                        blueprint[key as keyof Blueprint] = value as never;
                    }

                    if (!blueprint.id) {
                        return;
                    }

                    // Validate it. This will not do the compiler's job for us, only the stuff that the compiler doesn't do.
                    // That means that the blueprint isn't very validated, which means this WILL crash if you create an invalid card.
                    game.functions.card.validateBlueprint(blueprint);

                    // The default type is CLI
                    let type = 'CLI';
                    if (overrideType) {
                        type = overrideType;
                    }

                    cclib.create(type as CcType, blueprint.type, blueprint, undefined, undefined, debug);
                });

                break;
            }

            case 'dc': {
                dc.main();

                break;
            }

            case 'game': {
                src.main();

                break;
            }

            default: { if (name === 'script') {
                const name = args[0];
                if (!name) {
                    game.logError('<red>Invalid script name!</red>');
                    game.pause();
                    return;
                }

                // TODO: Implement.
                throw new Error('not implemented');
            } else {
                game.logWarn('<yellow>That is not a valid command.</yellow>');
                game.pause();
            }
            }
        }
    });
}
