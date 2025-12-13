<script lang="ts">
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import { m } from "$lib/paraglide/messages.js";

	let { data, form } = $props();
</script>

{#await data.cards}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then cards}
	<PackBig
		pack={cards.packs.latest}
		all={cards.packs.all}
		cards={cards.all}
		user={data.user}
		{form}
		class="rounded-b-none"
	/>
	<CardBig
		card={cards.latest}
		cardsAll={cards.all}
		pack={cards.packs.latest}
		packsAll={cards.packs.all}
	/>

	<!-- <pre>{JSON.stringify(cards, null, 4)}</pre> -->
{/await}
