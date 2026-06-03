<script lang="ts">
	import type { Resource, PackWithExtras } from "$lib/db/schema";
	import CardBig from "./card-big.svelte";

	let {
		resource,
		pack,
	}: {
		resource: Resource;
		pack: PackWithExtras;
	} = $props();
</script>

{#if resource.type === "card"}
	<CardBig card={resource} {pack} />
{:else}
	<p>Sorry, no support for resource types other than cards at the moment :(</p>
{/if}
