import type { Pack } from "./db/schema";
import type { ClientUser } from "./server/auth";
import { satisfiesRole } from "./user";

export type CensoredPack = Exclude<Pack, "approvedBy">;
export function censorPack(
	pack: Pack,
	user: ClientUser = null,
	skipIfModerator = true,
): CensoredPack | Pack {
	if (skipIfModerator && satisfiesRole(user, "Moderator")) {
		return pack;
	}

	const censored = ["approvedBy"];
	const censoredPack: CensoredPack = {} as any;

	for (const [key, value] of Object.entries(pack)) {
		if (censored.includes(key)) {
			continue;
		}

		(censoredPack as any)[key] = value;
	}

	return censoredPack;
}
