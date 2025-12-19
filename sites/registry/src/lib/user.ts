import type { Profile, Role, User } from "./db/schema";
import type { ClientUser } from "./server/auth";

const table: Record<Role, number> = {
	User: 0,
	Moderator: 1,
	Admin: 2,
};

export function satisfiesRole(user: ClientUser, role: Role) {
	if (!user) {
		return false;
	}

	return table[user.role] >= table[role];
}

export type CensoredUser = Exclude<User, "passwordHash">;
export function censorUser(user: User | null): CensoredUser {
	const censored = ["passwordHash"];
	const censoredUser: CensoredUser = {} as any;

	for (const [key, value] of Object.entries(user)) {
		if (censored.includes(key)) {
			continue;
		}

		(censoredUser as any)[key] = value;
	}

	return censoredUser;
}

export interface UserAndProfile extends CensoredUser {
	profile: Profile;
}
