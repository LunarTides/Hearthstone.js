<script lang="ts">
	let { data } = $props();
</script>

<p>Card:</p>

{#await data.card}
	<p>Loading...</p>
{:then card}
	<pre>{JSON.stringify(card, null, 4)}</pre>
{/await}
