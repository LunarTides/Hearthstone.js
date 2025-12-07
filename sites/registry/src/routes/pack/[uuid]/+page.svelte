<script lang="ts">
	let { data } = $props();
</script>

<p>Pack:</p>

<pre>{JSON.stringify(data.pack, null, 4)}</pre>
