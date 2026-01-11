<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";

	let { data } = $props();
</script>

<FileTree files={data.files} />
