<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import type { FileTree } from "$lib/api/types";
	import { Folder, File } from "lucide-svelte";

	let {
		files,
	}: {
		files: FileTree[] | undefined;
	} = $props();
</script>

<table class="w-full">
	<tbody>
		{#if page.params.path}
			<!-- Add ".." -->
			<tr class="flex gap-1 bg-background p-2">
				<th class="text-yellow-100">
					<Folder />
				</th>
				<td>
					<a
						href={resolve("/pack/[uuid]/versions/[version]/files/[...path]", {
							uuid: page.params.uuid!,
							version: page.params.version!,
							path: page.params.path.split("/").slice(0, -1).join("/"),
						})}
					>
						..
					</a>
				</td>
			</tr>
		{/if}
		{#each files?.toSorted((a, b) => {
			// Sort it by name, but put directories first.
			if (a.type === b.type) {
				return a.path.localeCompare(b.path);
			}

			return a.type === "directory" ? -1 : 1;
		}) as file (file.path)}
			<tr class="flex gap-1 p-2 alternating-children">
				<th class="text-yellow-100">
					{#if file.type === "directory"}
						<Folder />
					{:else if file.type === "file"}
						<File />
					{/if}
				</th>
				<td>
					<a
						href={resolve("/pack/[uuid]/versions/[version]/files/[...path]", {
							uuid: page.params.uuid!,
							version: page.params.version!,
							path: file.path,
						})}
					>
						{file.path.split("/").at(-1)}
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
