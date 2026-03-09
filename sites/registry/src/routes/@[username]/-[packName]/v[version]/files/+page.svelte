<script lang="ts">
	import FileTree from "$lib/components/file-tree.svelte";
	import Section from "$lib/components/section.svelte";

	let { data } = $props();
</script>

<!-- File Tree -->
<Section>
	<p class="mb-2">Files ({data.files.length})</p>
	<FileTree files={data.files} />
</Section>
