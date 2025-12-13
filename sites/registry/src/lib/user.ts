import type { Role } from "./db/schema";
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
