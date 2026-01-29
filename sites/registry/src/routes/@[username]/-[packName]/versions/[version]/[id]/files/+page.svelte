<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";

	let { data } = $props();
</script>

<!-- File Tree -->
<div class="m-1 p-2 bg-header rounded-md">
	<p class="mb-2">Files ({data.files.length})</p>
	<FileTree files={data.files} />
</div>
