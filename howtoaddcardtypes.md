# Creating a card type:

## Updating types:
1. Add the card type to the `CardType` type in `src/types.ts`.
2. Add any card type specific fields to the `Blueprint` type in `src/types.ts`. E.g. `test?: number` after `hpCost?: number`
3. Add any card type specific abilities to the `CardAbilityReal` in `src/types.ts`

## Updating card creators:
1. Add a default function for the card type in `cardcreator/lib.ts:getCardFunction`

1. Add a function for creating the card class in `cardcreator/custom/index.ts`. Just copy an existing one, like `location()` and change it.
2. Add the function to `cardcreator/custom/index.ts:main` in the switch statement

1. If the card class exists in vanilla Hearthstone, add code for it in `cardcreator/vanilla/index.ts:create`.

## Updating card class:
1. Add any card class specific fields to the `Card` class in `src/card.ts`. For example, `test?: number` after `cooldown?: number = 2`.
2. Add any code for the card class in `src/card.ts`.

## Updating helper functions
1. If the card is going on the board, update `src/functions.ts:canBeOnBoard`
2. If the card has stats, update `src/functions.ts:hasStats`

## Updating playing cards
1. Add code for playing the card in `src/game.ts:playCard`.
    1. Add the card class to the switch statement in `play`
    2. Copy and paste, for example, `_playMinion` and change it to do the code you want

## Other
1. Add any code for the card class in `src/game.ts` functions.
2. Add code for it in `src/interact:getReadableCard`.

## Optional
1. Add an example card for it.
2. Add a card class specific command. See the `use` command for an example of how to do this.
3. Add ai code for it. (This is optional since it is hard)