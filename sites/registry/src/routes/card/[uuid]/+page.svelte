<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();
</script>

<p>{m.broad_awake_jay_dial()}</p>

{#await data.card}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then card}
	<pre>{JSON.stringify(card, null, 4)}</pre>
{/await}
