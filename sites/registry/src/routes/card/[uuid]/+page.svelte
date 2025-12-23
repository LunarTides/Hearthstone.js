<script lang="ts">
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import { m } from "$lib/paraglide/messages.js";

	let { data, form } = $props();
</script>

<!-- TODO: Page doesn't render when there is an unapproved pack with no approved versions. -->
{#await data.cards}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then cards}
	<PackBig packs={cards.packs} {cards} user={data.user} {form} class="rounded-b-none" />
	<CardBig {cards} packs={cards.packs} />

	<!-- TODO: Show the card's code. -->
	<!-- <pre>{JSON.stringify(cards, null, 4)}</pre> -->
{/await}
