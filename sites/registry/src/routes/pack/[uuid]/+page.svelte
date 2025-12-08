<script lang="ts">
	let { data } = $props();
</script>

<p>Pack:</p>

{#await data.pack}
	<p>Loading...</p>
{:then pack}
	<pre>{JSON.stringify(pack, null, 4)}</pre>
{/await}
