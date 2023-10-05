import * as src from "../src/index.js";                 // Source Code
import * as dc  from "../tools/deckcreator.js";         // Deck Creator
import * as ccc from "../tools/cardcreator/custom.js";  // Custom Card Creator
import * as vcc from "../tools/cardcreator/vanilla.js"; // Vanilla Card Creator
import * as clc from "../tools/cardcreator/class.js";   // Class Creator
import * as cclib from "../tools/cardcreator/lib.js";   // Class Creator

import { validateBlueprint } from "../src/helper/validator.js";
import { Blueprint } from "../src/types.js";
import { CCType } from "./cardcreator/lib.js";

export function main(userInputLoop: (prompt: string, exitCharacter: string | null, callback: (input: string) => any) => any) {
    // Common card creator variant stuff
    const doCardCreatorVariant = (usedOptions: string[], args: string[], callback: (debug: boolean, overrideType?: CCType) => any) => {
        const doDryRun = usedOptions.includes("--dry-run");
        const doCCType = usedOptions.includes("--cc-type");

        let ccType: CCType | undefined;

        // Get cctype
        if (doCCType) {
            ccType = args[0] as CCType;

            if (!ccType) {
                game.logError("<red>Invalid cc type!</red>");
                game.input();
                return;
            }
        }

        callback(doDryRun, ccType);
    }

    // Main loop
    userInputLoop("> ", null, (input) => {
        let args = input.split(" ");
        const name = args.shift()?.toLowerCase();
        if (!name) {
            throw new Error("Name is undefined. This should never happen.");
        }

        // Options - Long, short
        const cmdOptions = [
            ["--dry-run", "-n"],
            ["--cc-type", "-t"],
            ["--replay", "-r"],
        ];

        // Parse args
        const usedOptions: string[] = [];

        // Clone the args. Kinda hacky.
        const parsedArgs = JSON.parse(`[${args.map(arg => `"${arg.replaceAll(`"`, `'`)}"`)}]`);
        parsedArgs.forEach((arg: string) => {
            // Parse -dt
            if (/^-\w\w+/.test(arg)) {
                const allArgs = arg.split("");
                allArgs.shift();

                allArgs.forEach(a => {
                    const option = cmdOptions.find(option => option.includes("-" + a))?.[0];
                    if (!option) return;

                    usedOptions.push(option);
                });

                args.shift();
                return;
            }

            // Parse -d or --dry-run
            const option = cmdOptions.find(option => option.includes(arg))?.[0];
            if (!option) return;

            usedOptions.push(option);
            args.shift();
        });

        if (name === "help") {
            // Taken heavy inspiration from 'man'
            game.log("\n<bold>Commands</bold>");
            game.log("ccc           - Runs the custom card creator");
            game.log("vcc           - Runs the vanilla card creator");
            game.log("clc           - Runs the class creator");
            game.log("cclib (args)  - Uses the card creator library to manually create a card");
            game.log("dc            - Runs the deck creator");
            game.log("game [replay] - Runs the main game");
            game.log("script (name) - Runs the specified script (NOT IMPLEMENTED!)");
            game.log();
            game.log("<bold>Options</bold>");
            game.log("    <bold>Card Creator Options (ccc, vcc, clc, cclib)</bold>")
            game.log("        <bold>-n, --dry-run</bold>\n            Don't actually create the card, just show what would be done.");
            game.log("        <bold>-t <underline>type</underline>, --cc-type <underline>type</bold underline>\n            Set the name of the card creator");
            game.log();
            game.log("    <bold>CCLib Options (cclib)</bold>");
            game.log("        <bold>name</bold>=<underline>name</underline><bold>");
            game.log("        <bold>stats</bold>=<underline>[attack, health]</underline><bold>");
            game.log();
            game.log("<bold>CCLib Example</bold>");
            game.log(`cclib -dt Test name="Sheep" stats=[1,1] text="" cost=1 type="Minion" tribe="Beast" classes=["Neutral"] rarity="Free" uncollectible=true id=0`);
            game.log(`       ^^      ^            ^           ^`);
            game.log(`       Dry-run The name of the card     The description of the card. Etc...`);
            game.log(`        CC type is "Test"   The stats of the card`);
            game.log();
            game.input();
        }
        // Custom Card Creator
        else if (name === "ccc") {
            doCardCreatorVariant(usedOptions, args, ccc.main);
        }
        // Vanilla Card Creator
        else if (name === "vcc") {
            doCardCreatorVariant(usedOptions, args, vcc.main);
        }
        // Class Creator
        else if (name === "clc") {
            doCardCreatorVariant(usedOptions, args, clc.main);
        }
        // Card Creator Library
        else if (name === "cclib") {
            doCardCreatorVariant(usedOptions, args, (debug, overrideType) => {
                // Here we implement our own card creator variant

                // Only include args with an '=' in it.
                args = args.filter(arg => arg.includes("="));

                const blueprint: Blueprint = {} as Blueprint;
                args.forEach(arg => {
                    let [key, val] = arg.split("=");

                    // Parse it as its real value instead of a string.
                    val = JSON.parse(`[ ${val} ]`)[0];

                    // HACK: Use of never
                    blueprint[key as keyof Blueprint] = val as never;
                });
                if (!blueprint.name) return;

                // Validate it. This will not do the compiler's job for us, only the stuff that the compiler doesn't do.
                // That means that the blueprint isn't very validated, which means this WILL crash if you create an invalid card.
                validateBlueprint(blueprint);

                // The default type is CLI 
                let type = "CLI";
                if (overrideType) type = overrideType;

                cclib.create(type as CCType, blueprint.type, blueprint, undefined, undefined, debug);
            });
        }
        // Deck Creator
        else if (name === "dc") {
            dc.main();
        }
        else if (name === "game") {
            const replay = usedOptions.includes("--replay");

            let replayPath: string | undefined;

            // Get replay path
            if (replay) {
                replayPath = args[0] as CCType;

                if (!replayPath) {
                    game.logError("<red>Invalid replay path!</red>");
                    game.input();
                    return;
                }

                replayPath = `/logs/log-${replayPath}.txt`;
            }

            src.main(replayPath);
        }
        else if (name == "script") {
            const name = args[0];
            if (!name) {
                game.logError("<red>Invalid script name!</red>");
                game.input();
                return;
            }

            // TODO: Implement
            throw new Error("not implemented");
        }
        else {
            game.logWarn("<yellow>That is not a valid command.</yellow>");
            game.input();
        }
    });
}
