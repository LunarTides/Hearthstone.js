<script lang="ts">
	import { satisfiesRole, type UserAndProfile } from "$lib/user";
	import Badge from "./badge.svelte";
	import type { ClientUser } from "$lib/server/auth";

	let {
		user,
		clientUser,
	}: {
		user: UserAndProfile;
		clientUser: ClientUser;
	} = $props();

	const avatarPromise = import(`$lib/../../static/avatars/${user.username}.avif`).catch(() => {});

	let aboutMe = $derived(user.profile.aboutMe);
	let pronouns = $derived(user.profile.pronouns);
</script>

<!-- TODO: Add external links -->
<div class="flex gap-1">
	<div class="p-3 bg-header text-white w-full rounded-lg">
		<div class="flex flex-col gap-1">
			<div class="flex gap-2">
				{#await avatarPromise}
					<div class="p-6 bg-white rounded-full size-12"></div>
				{:then avatar}
					<img alt="Avatar" class="size-12" src={avatar.default.split("/static")[1]} />
				{/await}

				<p class="text-xl self-center">{user.username}</p>

				{#if pronouns}
					<p class="text-sm text-gray-500 self-center min-w-full mr-8">
						({pronouns})
					</p>
				{/if}
			</div>

			<pre>{aboutMe}</pre>

			<div class="mt-auto">
				{#if satisfiesRole(user, "Moderator")}
					<Badge class="bg-blue-200 text-black">{user.role}</Badge>
				{/if}
			</div>
		</div>
	</div>
</div>
