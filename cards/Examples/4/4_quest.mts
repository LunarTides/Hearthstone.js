// Created by Hand

// Import the card type
import { Card } from "@game/internal.js";
import { Blueprint, EventValue } from "@game/types.js";

export const blueprint: Blueprint = {
    name: "Quest Example",

    // The description doesn't need to look like this, it is just what Hearthstone does, so we copy it here.
    desc: "Quest: Play 3 cards. Reward: Return those cards back to your hand.",

    mana: 1,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 59,

    cast(plr, game, self) {
        // Create a list of cards to put the 3 cards into
        let cards: Card[] = [];

        // addQuest(
        //     type_of_quest,
        //     player_the_quest_belongs_to,
        //     the_card_that_created_the_quest,
        //     the_key_of_the_event_to_listen_to,
        //     the_amount_of_times_that_event_has_to_be_broadcast_for_the_quest_to_be_done,
        //     the_function_to_run_for_each_event_broadcast: Function(
        //         value_of_the_event,
        //         if_the_quest_has_triggered_enough_times,
        //     ) -> if the event should count towards the quest: bool
        // );
        game.functions.addQuest("Quest", plr, self, "PlayCard", 3, (_unknownVal, done) => {
            // This code runs every time the `PlayCard` event gets broadcast.
            // This is like the first function in the event listener function.

            // Get the value of the event
            const val = _unknownVal as EventValue<"PlayCard">;

            // Returning false will prevent this event from counting towards the quest
            // If the card played was this card, it doesn't count towards this quest.

            // The `PlayCard` event gets triggered after the text of the card played.
            // That means when you play this card, the quest gets added, then the `PlayCard` event gets broadcast,
            // which triggers this quest. So we need to prevent that event from counting towards the quest.
            if (val == self) return false;

            // Otherwise, add it to the cards array, and count it.
            cards.push(val);

            // Return true to count this event towards the quest
            // Only return if the quest isn't considered done. It is considered done if the quest has been triggered enough times (in this case 3).
            if (!done) return true;

            // The quest is done. The code above has been triggered 3 times in total.

            // Go through the list of cards that was played, and add them back to the player's hand
            cards.forEach(c => {
                // Create an imperfect copy of the card.
                // This is what heartstone does when a card gets bounced back to a player's hand, for example.
                // This gets the card back to its original state. Defined by this blueprint.

                // This also prevents cards from being `linked`. If two cards are linked, anything that happens to one of them will happen to the other.
                // If you don't want the card to be reset, but you want to avoid it being linked, use `perfectCopy`
                // If we were to do `plr.addToHand(c)`, the card added to the player's hand would be (most likely) linked to the original card.

                const card = c.imperfectCopy();

                // Add the imperfect copy of the card to the player's hand
                plr.addToHand(card);
            });

            return true;
        }); // Put `}, "name of the next spell");`, to make a questline. When the quest gets completed, a card with that name gets created and the game immediately activates its cast ability.
    }
}
