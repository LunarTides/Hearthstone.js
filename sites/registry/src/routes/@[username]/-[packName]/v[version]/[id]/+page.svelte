<script lang="ts">
	let { data } = $props();
</script>

<!-- Readme -->
<div class="m-1 p-2 bg-header rounded-md">
	{#if data.readme}
		<div class="markdown">
			{@html data.readmeHTML}
		</div>
	{:else}
		<p>No README file found.</p>
	{/if}
</div>
