<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";

	let { data } = $props();
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	{#if packs}
		<div class="flex gap-1 px-2">
			{#each packs as versions (versions.uuid)}
				{#if versions.relevantPacks.length > 0}
					<!-- Latest version -->
					<PackSmall pack={versions.relevantPacks[0]} clientUser={data.user} navigateToVersion />
				{/if}
			{/each}
		</div>
	{/if}
{/await}
