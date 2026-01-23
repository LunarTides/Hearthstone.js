<script lang="ts">
	import GroupSmall from "$lib/components/group-small.svelte";

	const { data } = $props();
</script>

{#await data.groups}
	<p>Loading...</p>
{:then groups}
	<div class="flex flex-col gap-1 m-2">
		{#each groups as group (group.username)}
			<GroupSmall {group} clientUser={data.user} />
		{/each}
	</div>
{/await}
