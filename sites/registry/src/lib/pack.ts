import { exclude } from "$lib";
import type { Pack } from "./db/schema";
import type { ClientUser } from "./server/auth";
import { satisfiesRole } from "./user";

export type CensoredPack = Omit<Pack, "approvedBy">;
export function censorPack(pack: Pack, user: ClientUser = null, skipIfModerator = true) {
	if (skipIfModerator && satisfiesRole(user, "Moderator")) {
		return pack;
	}

	return exclude(pack, ["approvedBy"]);
}
