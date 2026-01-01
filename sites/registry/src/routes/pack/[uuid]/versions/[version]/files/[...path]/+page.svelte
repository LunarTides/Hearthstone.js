<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";

	let { data } = $props();
</script>

{#await data.relevantFile}
	<p>Loading...</p>
{:then fileInfo}
	<FileTree files={fileInfo.tree?.children} />

	{#if fileInfo.file.type === "file"}
		<div class="">
			<HighlightAuto code={fileInfo.file.content} let:highlighted>
				<LineNumbers {highlighted} />
			</HighlightAuto>
		</div>
	{/if}
{/await}
