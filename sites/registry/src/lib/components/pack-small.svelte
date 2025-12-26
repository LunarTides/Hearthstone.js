<script lang="ts">
	import { resolve } from "$app/paths";
	import { type PackWithExtras } from "$lib/db/schema";
	import { Download, ThumbsDown, ThumbsUp } from "lucide-svelte";
	import Badge from "./badge.svelte";

	let {
		pack,
		navigateToVersion = false,
	}: {
		pack: PackWithExtras;
		navigateToVersion?: boolean;
	} = $props();
</script>

<div class="w-fit">
	<a
		href={navigateToVersion
			? resolve("/pack/[uuid]/versions/[version]", { uuid: pack.uuid, version: pack.packVersion })
			: resolve("/pack/[uuid]", { uuid: pack.uuid })}
	>
		<div
			class="text-white p-4 rounded-xl w-fit bg-cover transition-all bg-slate-600 hover:scale-105 hover:drop-shadow-2xl"
		>
			<p class="font-bold">{pack.name} ({pack.packVersion})</p>
			<p class="text-xs mb-2">{pack.authors.join(", ")}</p>
			<p>{pack.description}</p>
			<p class="font-mono">({pack.license} | {pack.gameVersion})</p>

			{#if pack.approved}
				<div class="flex gap-4">
					<div class="flex gap-1">
						<Download />
						<p class="text-lg font-bold font-mono">{pack.totalDownloadCount}</p>
					</div>
					<div class="flex gap-1">
						{#if pack.likes.positive >= pack.likes.negative}
							<ThumbsUp class={pack.likes.hasLiked ? "fill-green-400" : ""} />
						{:else}
							<ThumbsDown class={pack.likes.hasDisliked ? "fill-red-400" : ""} />
						{/if}
						<p class="text-lg font-bold font-mono">
							{pack.likes.positive - pack.likes.negative}
						</p>
					</div>
				</div>
			{/if}

			<div class="flex gap-1 not-empty:mt-1">
				{#if !pack.approved}
					<Badge class="bg-yellow-300 text-slate-600">Waiting for approval</Badge>
				{/if}
			</div>
		</div>
	</a>
</div>
