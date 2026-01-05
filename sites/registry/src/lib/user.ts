import { exclude } from "$lib";
import type { Profile, Role, User } from "./db/schema";
import type { ClientUser } from "./server/auth";

export const RoleTable: Record<Role, number> = {
	User: 0,
	Moderator: 1,
	Admin: 2,
};

export function satisfiesRole(user: ClientUser, role: Role) {
	if (!user) {
		return false;
	}

	return RoleTable[user.role] >= RoleTable[role];
}

export type CensoredUser = ReturnType<typeof censorUser>;
export function censorUser(user: User) {
	return exclude(user, ["passwordHash", "creationDate"]);
}

export interface UserAndProfile extends CensoredUser {
	profile: Profile;
}
