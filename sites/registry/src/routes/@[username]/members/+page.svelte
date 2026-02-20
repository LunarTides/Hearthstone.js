<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import GroupMemberSmall from "$lib/components/group-member-small.svelte";
	import { UserRoundPlus } from "lucide-svelte";

	const { data } = $props();
</script>

{#await data.canEditUser}
	<p>Loading...</p>
{:then canEditUser}
	{#if canEditUser}
		<a
			href={resolve("/@[username]/members/new", { username: page.params.username! })}
			class="flex m-2 mr-0 p-2 bg-header gap-1 rounded-md transition-all hover:scale-y-105 hover:drop-shadow-lg active:scale-y-95"
		>
			<UserRoundPlus class="size-7.5" />
			<p class="text-lg">Invite Member</p>
		</a>
	{/if}
{/await}

{#await data.members}
	<p>Loading...</p>
{:then members}
	<div class="flex flex-col gap-1 m-2 mr-0">
		{#each members as member (member.username)}
			<GroupMemberSmall {member} clientUser={data.user} />
		{/each}
	</div>
{/await}
