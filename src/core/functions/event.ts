import { EventKey, EventListenerCallback, TickHookCallback, QuestCallback } from "@Game/types.js";
import { Card, Player } from "@Game/internal.js";

const quest = {
    /**
     * Progress a quest by a value
     * 
     * @param plr The player
     * @param name The name of the quest
     * @param value The amount to progress the quest by
     * 
     * @returns The new progress
     */
    progress(plr: Player, name: string, value: number = 1): number | null {
        let quest = plr.secrets.find(s => s["name"] == name);
        if (!quest) quest = plr.sidequests.find(s => s["name"] == name);
        if (!quest) quest = plr.quests.find(s => s["name"] == name);
        
        if (!quest) return null;
        quest["progress"][0] += value;

        return quest["progress"][0];
    },

    /**
     * Adds a quest / secrets to a player
     * 
     * @param type The type of the quest
     * @param plr The player to add the quest to
     * @param card The card that created the quest / secret
     * @param key The key to listen for
     * @param amount The amount of times that the quest is triggered before being considered complete
     * @param callback The function to call when the key is invoked.
     * @param next The name of the next quest / sidequest / secret that should be added when the quest is done
     * 
     * @returns Success
     */
    add(type: "Quest" | "Sidequest" | "Secret", plr: Player, card: Card, key: EventKey, amount: number, callback: QuestCallback, next?: string): boolean {
        let t;
        if (type == "Quest") t = plr.quests;
        else if (type == "Sidequest") t = plr.sidequests;
        else if (type == "Secret") t = plr.secrets;
        else return false;

        if ( (type.toLowerCase() == "quest" && t.length > 0) || ((type.toLowerCase() == "secret" || type.toLowerCase() == "sidequest") && (t.length >= 3 || t.filter(s => s.name == card.displayName).length > 0)) ) {
            plr.addToHand(card);
            return false;
        }

        t.push({"name": card.displayName, "progress": [0, amount], "key": key, "value": amount, "callback": callback, "next": next});
        return true;
    }
}

export const eventFunctions = {
    /**
     * Quest related functions
     */
    quest,

    /**
     * Add an event listener.
     *
     * @param key The event to listen for. If this is an empty string, it will listen for any event.
     * @param callback The code that will be ran if the event listener gets triggered and gets through `checkCallback`. If this returns true, the event listener will be destroyed.
     * @param lifespan How many times the event listener will trigger and call "callback" before self-destructing. Set this to -1 to make it last forever, or until it is manually destroyed using "callback".
     *
     * @returns If you call this function, it will destroy the event listener.
     */
    addListener(key: EventKey | "", callback: EventListenerCallback, lifespan: number = 1): () => boolean {
        let times = 0;

        const id = game.events.eventListeners;
        let alive = true;

        /**
         * Destroys the eventlistener and removes it from the game event listeners.
         *
         * @return Returns true if the object was successfully destroyed, false otherwise.
         */
        const destroy = () => {
            if (!alive) return false;

            delete game.eventListeners[id];
            alive = false;
            return true;
        }

        game.eventListeners[id] = (_key, _unknownVal) => {
            // Im writing it like this to make it more readable

            // Validate key. If key is empty, match any key.
            if (key === "" || _key as EventKey === key) {}
            else return;

            const msg = callback(_unknownVal);
            times++;

            switch (msg) {
                case "destroy":
                    destroy();
                    break;
                case "reset":
                    times = 0;
                    break;
                case false:
                    times--;
                    break;
                case true:
                    break;
                default:
                    break;
            }

            if (times == lifespan) destroy();
        }

        game.events.eventListeners++;

        return destroy;
    },

    /**
     * Hooks a callback function to the tick event.
     *
     * @param callback The callback function to be hooked.
     * 
     * @returns A function that, when called, will remove the hook from the tick event.
     */
    hookToTick(callback: TickHookCallback): () => void {
        game.events.tickHooks.push(callback);

        const unhook = () => {
            game.functions.util.remove(game.events.tickHooks, callback);
        }

        return unhook;
    },

    /**
     * Suppresses the specified event key by adding it to the list of suppressed events.
     *
     * @param key The event key to be suppressed.
     * @return A function that undoes the suppression.
     */
    suppress(key: EventKey) {
        game.events.suppressed.push(key);

        /**
         * Unsuppresses the event key.
         */
        const unsuppress = () => {
            return game.functions.util.remove(game.events.suppressed, key);
        }

        return unsuppress;
    },
}
