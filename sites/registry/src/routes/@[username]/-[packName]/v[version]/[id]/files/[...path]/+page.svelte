<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";

	let { data } = $props();
</script>

{#await data.relevantFile}
	<p>Loading...</p>
{:then fileInfo}
	<div class="m-1 p-2 bg-header rounded-md">
		<p class="mb-2">Files ({fileInfo.tree?.children?.length ?? 0})</p>
		<FileTree files={fileInfo.tree?.children} />
	</div>

	{#if fileInfo.file.type === "file"}
		<div class="">
			<HighlightAuto code={fileInfo.file.content} let:highlighted>
				<LineNumbers {highlighted} class="m-1 rounded-md" />
			</HighlightAuto>
		</div>
	{/if}
{/await}
