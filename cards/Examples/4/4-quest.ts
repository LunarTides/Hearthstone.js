// Created by Hand

// Import the card type. Use the `internal` module when importing anything from the game. (except for the `types`)
import { type Blueprint, type EventValue } from '@Game/types.js';
import { type Card } from '../../../src/core/card.js';

export const BLUEPRINT: Blueprint = {
    name: 'Quest Example',

    // The description doesn't need to look like this, it is just what Hearthstone does, so we copy it here.
    text: 'Quest: Play 3 cards. Reward: Return those cards back to your hand.',

    cost: 1,
    type: 'Spell',
    spellSchool: 'None',
    classes: ['Neutral'],
    rarity: 'Free',
    uncollectible: true,
    id: 58,

    cast(plr, self) {
        // Quest: Play 3 cards. Reward: Return those cards back to your hand.

        // Create a list of cards to put the 3 cards into
        const CARDS: Card[] = [];

        // AddQuest(
        //     type of quest,
        //     the card that created the quest,
        //     the key of the event to listen to,
        //     the amount of times that event has to be broadcast for the quest to be done,
        //     the function to run for each event broadcast: Function(
        //         value of the event,
        //         if the quest has triggered enough times,
        //     ) -> if the event should count towards the quest: bool
        // );
        plr.addQuest('Quest', self, 'PlayCard', 3, (_unknownValue, done) => {
            // This code runs every time the `PlayCard` event gets broadcast.
            // This is like the callback function in event listeners.

            // Get the value of the event
            const VALUE = _unknownValue as EventValue<'PlayCard'>;

            // Returning false will prevent this event from counting towards the quest
            // If the card played was this card, it doesn't count towards this quest.

            // The `PlayCard` event gets triggered after the text of the card played.
            // That means when you play this card, the quest gets added, then the `PlayCard` event gets broadcast,
            // which triggers this quest. So we need to prevent that event from counting towards the quest.
            if (!(VALUE !== self)) {
                return false;
            }

            // Otherwise, add it to the cards array, and count it.
            CARDS.push(VALUE);

            // Return true to count this event towards the quest
            // Only return if the quest isn't considered done. It is considered done if the quest has been triggered enough times (in this case 3).
            if (!done) {
                return true;
            }

            // The quest is done. The code above has been triggered 3 times in total.

            // Go through the list of cards that was played, and add them back to the player's hand
            for (const PLAYED_CARD of CARDS) {
                // Create an imperfect copy of the card.
                // This is what heartstone does when a card gets bounced back to a player's hand, for example.
                // This puts the card back to its original state. Defined by this blueprint.

                // This also prevents cards from being `linked`. If two cards are linked, anything that happens to one of them will happen to the other.
                // If you don't want the card to be reset, but you want to avoid it being linked, use `perfectCopy`
                // If we were to do `plr.addToHand(playedCard)`, the card added to the player's hand would be (most likely) linked to the original card.

                const CARD = PLAYED_CARD.imperfectCopy();

                // Add the imperfect copy of the card to the player's hand
                plr.addToHand(CARD);
            }

            // Return true to count this event towards the quest
            // This finishes the quest
            return true;
        }); // Put `}, "name of the next spell");`, to make a questline. When the quest gets completed, a card with that name gets created and the game immediately activates its cast ability.
    },

    test(plr, self) {
        // TODO: Add proper tests. #325
        return true;
    },
};
