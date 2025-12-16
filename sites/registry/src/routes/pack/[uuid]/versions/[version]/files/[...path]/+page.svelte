<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";
	import { m } from "$lib/paraglide/messages.js";
	import { HighlightAuto, LineNumbers } from "svelte-highlight";

	let { data } = $props();
</script>

{#await data.relevantFile}
	<p>{m.tidy_fancy_mule_prosper()}</p>
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
