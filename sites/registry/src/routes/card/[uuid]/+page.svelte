<script lang="ts">
	let { data } = $props();
</script>

<p>Card:</p>

<pre>{JSON.stringify(data.card, null, 4)}</pre>
