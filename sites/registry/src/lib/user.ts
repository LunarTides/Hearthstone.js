import { exclude } from "$lib";
import type { Group, Profile, Role, User } from "./db/schema";
import type { ClientUser } from "./server/auth";

export const RoleTable: Record<Role, number> = {
	User: 0,
	Moderator: 1,
	Admin: 2,
};

export function satisfiesRole(user: ClientUser | Group, role: Role): user is ClientUser {
	if (!user || !Object.hasOwn(user, "role")) {
		return false;
	}

	// @ts-expect-error `user.role` is confirmed to exist by the if-statement above
	return RoleTable[user.role] >= RoleTable[role];
}

export type CensoredUser = ReturnType<typeof censorUser>;
export function censorUser(user: User, clientUser: ClientUser, censor = { karma: true }) {
	const censoredUser = exclude(user, ["passwordHash", "creationDate"]);
	if (!satisfiesRole(clientUser, "Moderator")) {
		// Hide the karma amount when the requester is a regular user.
		if (censor.karma) {
			censoredUser.karma = 0;
		}
	}

	return censoredUser;
}

export interface UserAndProfile extends CensoredUser {
	profile: Profile;
}

export type UserOrGroup =
	| (UserAndProfile & { ownerType: "User" })
	| (Group & { ownerType: "Group" });
