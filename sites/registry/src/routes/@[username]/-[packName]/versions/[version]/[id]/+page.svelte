<script lang="ts">
	import { page } from "$app/state";
	import { marked } from "marked";
	import DOMPurify from "isomorphic-dompurify";

	let { data } = $props();
</script>

<!-- Readme -->
<div class="m-1 p-2 bg-header rounded-md">
	{#if data.readme}
		<div class="markdown">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html DOMPurify.sanitize(
				marked
					.parse(data.readme.content, { async: false, gfm: true })
					// Make `/files/` actually take you to the correct file.
					.replace('<a href="files/', `<a href="${page.params.id}/files/`),
			)}
		</div>
	{:else}
		<p>No README file found.</p>
	{/if}
</div>
