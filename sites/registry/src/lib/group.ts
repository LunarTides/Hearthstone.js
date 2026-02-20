import { exclude } from "$lib";
import type { Group, GroupProfile } from "./db/schema";
import type { ClientUser } from "./server/auth";
import { satisfiesRole } from "./user";

export type CensoredGroup = ReturnType<typeof censorGroup>;
export function censorGroup(group: Group, clientUser: ClientUser, censor = { karma: true }) {
	const censoredGroup = exclude(group, []);
	if (!satisfiesRole(clientUser, "Moderator")) {
		// Hide the karma amount when the requester is a regular user.
		if (censor.karma) {
			censoredGroup.karma = 0;
		}
	}

	return censoredGroup;
}

export function memberHasPermission(permissions: string[], permission: string) {
	if (permissions.includes("*") || permissions.includes("owner")) {
		return true;
	}

	// TODO: Handle categories
	return permissions.includes(permission);
}

export interface GroupAndProfile extends CensoredGroup {
	profile: GroupProfile;
}
