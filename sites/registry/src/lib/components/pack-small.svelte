<script lang="ts">
	import { resolve } from "$app/paths";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { type PackWithExtras } from "$lib/db/schema";
	import { Download, ThumbsDown, ThumbsUp } from "lucide-svelte";

	let {
		pack,
	}: {
		pack: PackWithExtras;
	} = $props();
</script>

<div class="w-fit">
	<a href={resolve("/pack/[uuid]", { uuid: pack.uuid })}>
		<div
			class="text-white p-4 rounded-xl w-fit bg-cover transition-all bg-gray-300 bg-blend-multiply hover:scale-105 hover:my-1 hover:drop-shadow-xl"
			style={`background-image: url(${cardboard})`}
		>
			<p class="font-bold">{pack.name} ({pack.packVersion})</p>
			<p class="text-xs mb-2">{pack.authors.join(", ")}</p>
			<p>{pack.description}</p>
			<p class="font-mono">({pack.license} | {pack.gameVersion})</p>
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
		</div>
	</a>
</div>
