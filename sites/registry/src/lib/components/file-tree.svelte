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
			<!--
				Add a `/` row that takes you to the root of the tree.
				The path only includes a path if we're inside a file / folder inside another folder.
				E.g. `sheep.ts`, `b`, `b/sheep.ts`, `b/c`, `b/c/sheep.ts`.
				     ^ In the cases where the path includes a slash, the `..` row doesn't take you to the root of the tree.
			-->
			{#if page.params.path.includes("/")}
				<tr class="flex gap-1 alternating-children p-2 rounded-lg">
					<th class="text-yellow-100">
						<Folder />
					</th>
					<td>
						<a
							href={resolve("/pack/[uuid]/versions/[version]/[id]/files", {
								uuid: page.params.uuid!,
								version: page.params.version!,
								id: page.params.id!,
							})}
						>
							/
						</a>
					</td>
				</tr>
			{/if}
			<!-- Add ".." -->
			<tr class="flex gap-1 alternating-children p-2 rounded-lg">
				<th class="text-yellow-100">
					<Folder />
				</th>
				<td>
					<a
						href={resolve("/pack/[uuid]/versions/[version]/[id]/files/[...path]", {
							uuid: page.params.uuid!,
							version: page.params.version!,
							id: page.params.id!,
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
			<tr class="flex gap-1 p-2 alternating-children rounded-lg">
				<th class="text-yellow-100">
					{#if file.type === "directory"}
						<Folder />
					{:else if file.type === "file"}
						<File />
					{/if}
				</th>
				<td>
					<a
						href={resolve("/pack/[uuid]/versions/[version]/[id]/files/[...path]", {
							uuid: page.params.uuid!,
							id: page.params.id!,
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
