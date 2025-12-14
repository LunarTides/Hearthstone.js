<script lang="ts">
	import { resolve } from "$app/paths";
	import { satisfiesRole, type UserAndProfile } from "$lib/user";
	import Badge from "./badge.svelte";

	let {
		user,
	}: {
		user: UserAndProfile;
	} = $props();
</script>

<div class="p-3 bg-slate-400 text-white w-fit rounded-lg">
	<div class="flex float-right">
		<a
			href={resolve("/user/[uuid]/delete", { uuid: user.id })}
			class="p-2 px-4 rounded-full bg-red-400 hover:cursor-pointer hover:bg-red-300 active:bg-red-500"
			>Delete</a
		>
	</div>

	<div>
		<div class="flex gap-2">
			<div class="p-6 bg-white rounded-full"></div>
			<p class="text-xl self-center">{user.username}</p>

			{#if user.profile.pronouns}
				<p class="text-sm text-slate-200 self-center">({user.profile.pronouns})</p>
			{/if}
		</div>

		<pre>{user.profile.aboutMe}</pre>

		{#if satisfiesRole(user, "Moderator")}
			<Badge class="bg-blue-200 text-slate-600">{user.role}</Badge>
		{/if}
	</div>
</div>
