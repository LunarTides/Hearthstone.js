<script lang="ts">
	let { form } = $props();
</script>

<p>Search</p>

<form method="post" enctype="multipart/form-data">
	<input name="query" type="text" />
	<button type="submit">Search</button>
</form>

{#each form?.packs as pack (pack.uuid)}
	<pre>{JSON.stringify(pack, null, 4)}</pre>
{/each}
