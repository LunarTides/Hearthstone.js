<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();
</script>

<p>{m.broad_awake_jay_dial()}</p>

{#await data.cards}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then cards}
	<pre>{JSON.stringify(cards, null, 4)}</pre>
{/await}
