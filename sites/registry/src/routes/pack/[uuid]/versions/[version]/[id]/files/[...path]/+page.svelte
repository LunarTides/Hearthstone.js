<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";

	let { data } = $props();

	let fileTreeOpen = $state(true);
</script>

{#await data.relevantFile}
	<p>Loading...</p>
{:then fileInfo}
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={fileTreeOpen}>
			<summary>File Tree ({fileInfo.tree?.children?.length ?? 0})</summary>
			<FileTree files={fileInfo.tree?.children} />
		</details>
	</div>

	{#if fileInfo.file.type === "file"}
		<div class="">
			<HighlightAuto code={fileInfo.file.content} let:highlighted>
				<LineNumbers {highlighted} class="m-1 rounded-md" />
			</HighlightAuto>
		</div>
	{/if}
{/await}
