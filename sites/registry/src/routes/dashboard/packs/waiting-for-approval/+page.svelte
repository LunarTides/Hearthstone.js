<script lang="ts">
	import PackSmall from "$lib/components/pack-small.svelte";

	const { data } = $props();
</script>

{#await data.packs}
	<p>Loading...</p>
{:then packs}
	<div class="flex flex-wrap gap-1">
		{#each packs as pack (pack.id)}
			<PackSmall {pack} clientUser={data.user} navigateToVersion hideApprovalBadge />
		{/each}
	</div>
{/await}
