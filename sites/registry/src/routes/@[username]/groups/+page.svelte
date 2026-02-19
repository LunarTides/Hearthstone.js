<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import GroupSmall from "$lib/components/group-small.svelte";
	import { Plus } from "lucide-svelte";

	const { data } = $props();
</script>

<!-- New Group -->
{#await data.currentUser}
	<p>Loading...</p>
{:then currentUser}
	{#if data.user?.username === currentUser.username}
		<a
			href={resolve("/@[username]/groups/new", { username: page.params.username! })}
			class="flex m-2 mr-0 p-2 bg-header rounded-md transition-all hover:scale-y-105 hover:drop-shadow-lg active:scale-y-95"
		>
			<Plus class="size-7.5" />
			<p class="text-lg">New Group</p>
		</a>
	{/if}
{/await}

{#await data.groups}
	<p>Loading...</p>
{:then groups}
	<div class="flex flex-col gap-1 m-2 mr-0">
		{#if groups.length > 0}
			{#each groups as group (group.username)}
				<GroupSmall {group} clientUser={data.user} />
			{/each}
		{:else}
			<p>No groups.</p>
		{/if}
	</div>
{/await}
