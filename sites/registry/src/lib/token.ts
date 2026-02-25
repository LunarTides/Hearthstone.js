import { exclude } from "$lib";
import * as table from "./db/schema";
import type { ClientUser } from "./server/auth";

export type CensoredGradualToken = ReturnType<typeof censorGradualToken>;
export function censorGradualToken(token: table.GradualToken, clientUser: ClientUser, censor = {}) {
	const censoredToken = exclude(token, ["hashedToken"]);
	return censoredToken;
}
