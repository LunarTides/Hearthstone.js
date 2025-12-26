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

<table class="text-yellow-100 w-full">
	<tbody>
		{#if page.params.path}
			<!-- Add ".." -->
			<tr class="flex gap-1 bg-slate-500 p-2">
				<th>
					<Folder />
				</th>
				<td class="text-white">
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
			<tr class="flex gap-1 odd:bg-slate-500 even:bg-slate-400 p-2">
				<th>
					{#if file.type === "directory"}
						<Folder />
					{:else if file.type === "file"}
						<File />
					{/if}
				</th>
				<td class="text-white">
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
