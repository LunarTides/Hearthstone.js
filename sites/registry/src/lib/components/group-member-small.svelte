<script lang="ts">
	import { resolve } from "$app/paths";
	import { satisfiesRole } from "$lib/user";
	import { Medal } from "lucide-svelte";
	import Badge from "./badge.svelte";
	import type { GroupMemberWithExtras } from "$lib/db/schema";
	import type { ClientUser } from "$lib/server/auth";

	let {
		member,
		clientUser,
	}: {
		member: GroupMemberWithExtras;
		clientUser: ClientUser;
	} = $props();

	const avatarPromise = import(`$lib/../../static/avatars/${member.username}.avif`).catch(() => {});
</script>

<div class="w-fit min-w-77.5">
	<a href={resolve("/@[username]", { username: member.username })}>
		<div class="p-4 rounded-xl transition-all bg-header hover:scale-105 hover:drop-shadow-2xl">
			<div class="flex flex-col gap-1">
				<div class="flex gap-2">
					{#await avatarPromise}
						<div class="p-6 bg-white rounded-full size-12"></div>
					{:then avatar}
						<img alt="Avatar" class="size-12" src={avatar.default.split("/static")[1]} />
					{/await}

					<p class="text-xl self-center">{member.username}</p>

					{#if member.user && satisfiesRole(clientUser, "Moderator")}
						<div
							class="flex w-fit h-fit self-center bg-background p-1 rounded-sm gap-0.5 *:self-center"
						>
							<Medal
								size="16"
								class={member.user.karma >= 0 ? "text-yellow-300" : "text-red-400"}
							/>
							<p>{member.user.karma}</p>
						</div>
					{/if}
				</div>

				<div class="mt-auto">
					{#if satisfiesRole(member.user, "Moderator")}
						<Badge class="bg-blue-200 text-black">{member.user.role}</Badge>
					{/if}
				</div>
			</div>
		</div>
	</a>
</div>
