<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import GroupSmall from "$lib/components/group-small.svelte";
	import { Plus } from "lucide-svelte";

	const { data } = $props();
</script>

<a
	href={resolve("/@[username]/groups/new", { username: page.params.username! })}
	class="flex min-w-77.5 m-2 p-2 bg-header w-fit rounded-md transition-all hover:scale-105 hover:drop-shadow-2xl"
>
	<Plus class="size-7.5" />
	<p class="text-lg">New Group</p>
</a>

{#await data.groups}
	<p>Loading...</p>
{:then groups}
	<div class="flex flex-col gap-1 m-2">
		{#each groups as group (group.username)}
			<GroupSmall {group} clientUser={data.user} />
		{/each}
	</div>
{/await}
