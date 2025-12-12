<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";
	import PackBig from "$lib/components/pack-big.svelte";

	let { data } = $props();
</script>

{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	<PackBig pack={packs.latest} all={packs.all} user={data.user} />

	<!-- <pre>{JSON.stringify(packs, null, 4)}</pre> -->
{/await}
