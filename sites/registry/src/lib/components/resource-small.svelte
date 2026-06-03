<script lang="ts">
	import type { Resource, PackWithExtras } from "$lib/db/schema";
	import CardSmall from "./card-small.svelte";

	let {
		resource,
		pack,
	}: {
		resource: Resource;
		pack: PackWithExtras;
	} = $props();
</script>

{#if resource.type === "card"}
	<CardSmall card={resource} {pack} />
{:else}
	<!-- TODO: Add support for other resources. -->
	<p>Sorry, no support for resource types other than cards at the moment :(</p>
{/if}
