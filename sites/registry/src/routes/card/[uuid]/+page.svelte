<script lang="ts">
	import CardBig from "$lib/components/card-big.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import { Highlight, LineNumbers } from "svelte-highlight";
	import { typescript } from "svelte-highlight/languages/typescript";

	let { data, form } = $props();
</script>

<!-- TODO: Page doesn't render when there is an unapproved pack with no approved versions. -->
{#await data.cards}
	<p>Loading...</p>
{:then cards}
	<PackBig packs={cards.packs} {cards} user={data.user} {form} class="rounded-b-none" />
	<CardBig {cards} packs={cards.packs} />

	<!-- TODO: Show the card's code. -->
	<!-- <pre>{JSON.stringify(cards, null, 4)}</pre> -->

	<div class="m-1">
		<Highlight
			language={typescript}
			code={cards.files.find((f) => f.id === cards.latest.id)!.file.content}
			let:highlighted
		>
			<LineNumbers class="rounded-md" {highlighted} />
		</Highlight>
	</div>
{/await}
