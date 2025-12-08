<script lang="ts">
	import { m } from "$lib/paraglide/messages.js";

	let { data } = $props();
</script>

<p>{m.crisp_misty_grebe_devour()}</p>

{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	<pre>{JSON.stringify(packs, null, 4)}</pre>
{/await}
