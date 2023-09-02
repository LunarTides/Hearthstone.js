// Created by Hand

// Import the card type
import { Card } from "../../../src/internal.js";
import { Blueprint, EventValue } from "../../../src/types.js";

const blueprint: Blueprint = {
    name: "Quest Example",
    desc: "Quest: Play 3 cards. Reward: Return those cards back to your hand.",
    mana: 1,
    type: "Spell",
    classes: ["Neutral"],
    rarity: "Free",
    uncollectible: true,
    id: 59,

    cast(plr, game, self) {
        let cards: Card[] = [];

        // addQuest(
        //     type_of_quest: string,
        //     player_the_quest_belongs_to: Player,
        //     the_card_that_created_the_quest: Card,
        //     the_key_of_the_event_to_listen_to: String,
        //     the_amount_of_times_that_event_has_to_be_broadcast_for_the_quest_to_be_done: int,
        //     the_function_to_run_for_each_event_broadcast: Function(
        //         value_of_the_event: any,
        //         the_turn_the_quest_was_added: int,
        //         if_the_quest_has_triggered_enough_times: bool,
        //     ) -> if the event should count towards the quest: bool
        // );
        game.functions.addQuest("Quest", plr, self, "PlayCard", 3, (_unknownVal, done) => {
            // This code runs every time the `PlayCard` event gets broadcast.
            const val = _unknownVal as EventValue<"PlayCard">;

            // Returning false will prevent this event from counting towards the quest
            // If the card played was this card, it doesn't count towards this quest.
            if (val == self) return false;

            // Otherwise, add it to the cards array, and count it.
            cards.push(val);

            // Return true to count this event towards the quest
            if (!done) return true;

            // The quest is done.
            cards.forEach(c => {
                plr.addToHand(c.imperfectCopy()); // Create an imperfect copy of the card to add to the player's hand
            });

            return true;
        }); // Put `}, "name_of_the_next_quest");`, to make a questline.
    }
}

export default blueprint;
