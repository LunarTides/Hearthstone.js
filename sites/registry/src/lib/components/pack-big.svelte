<script lang="ts">
	import { resolve } from "$app/paths";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { type Card, type PackWithExtras } from "$lib/db/schema";
	import { ThumbsDown, ThumbsUp } from "lucide-svelte";
	import { enhance } from "$app/forms";

	let {
		packs,
		cards,
		user,
		hideButtons = false,
		form,
		class: className,
	}: {
		packs: {
			latest: PackWithExtras;
			current?: PackWithExtras;
			all: PackWithExtras[];
		};
		cards: {
			all: Card[];
		};
		user: any;
		hideButtons?: boolean;
		form: any;
		class?: string;
	} = $props();

	const pack = $derived(packs.current ?? packs.latest);

	let canModeratePack = $derived(pack.userIds.includes(user?.id || "0"));

	// https://stackoverflow.com/a/18650828
	function formatBytes(bytes: number, decimals = 2) {
		if (!+bytes) {
			return "0 Bytes";
		}

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
</script>

<!-- TODO: Deduplicate code between this and the small pack. -->
<div
	class={`rounded-xl rounded-t-none p-7 bg-cover bg-gray-300 bg-blend-multiply text-white ${className ?? ""}`}
	style={`background-image: url(${cardboard});`}
>
	{#if !hideButtons}
		<div
			class="flex float-right m-2 mt-4 w-fit h-fit bg-blue-300 drop-shadow-2xl rounded-full outline-1 outline-black"
		>
			<a
				href={resolve("/pack/[uuid]/versions", { uuid: pack.uuid })}
				class="px-5 py-3 text-black rounded-full rounded-r-none hover:bg-cyan-200 active:bg-blue-400"
			>
				Download
			</a>
			<div class="border-l ml-auto h-auto text-black"></div>
			<a
				href={resolve("/pack/[uuid]/versions", { uuid: pack.uuid })}
				class="px-5 py-3 text-black hover:bg-cyan-200 active:bg-blue-400"
			>
				Versions ({packs.all.length})
			</a>
			<div class="border-l ml-auto h-auto text-black"></div>
			<!-- TODO: Show amount of cards. -->
			<a
				href={resolve("/pack/[uuid]", { uuid: pack.uuid })}
				class="px-5 py-3 text-black rounded-full rounded-l-none hover:bg-cyan-200 active:bg-blue-400"
			>
				Cards ({cards.all.length})
			</a>
		</div>
	{/if}

	<div class="flex flex-col">
		<div class="flex gap-1">
			<h1 class="text-xl font-bold">{pack.name}</h1>
			{#if !pack.isLatestVersion}
				<p class="text-gray-300 self-center">(v{pack.packVersion})</p>
			{/if}
		</div>
		<!-- TODO: Add clicking on the author if they have a connected account. -->
		<p class="font-semibold">({pack.authors.join(", ")})</p>
		{#if canModeratePack}
			<!-- TODO: Localize. -->
			<p class="text-green-300">You can administrate this pack.</p>
		{/if}

		<p class="mt-4">{pack.description}</p>

		<!-- TODO: Add links. -->

		<div class="flex mt-4 gap-2">
			<div>
				<p class="text-lg font-semibold">Pack Version</p>
				<hr />
				<p>{pack.packVersion}</p>
			</div>

			<div>
				<p class="text-lg font-semibold">Game Version</p>
				<hr />
				<p>{pack.gameVersion}</p>
			</div>

			<div>
				<p class="text-lg font-semibold">Unpacked Size</p>
				<hr />
				<p>{formatBytes(pack.unpackedSize)}</p>
			</div>

			<div>
				<p class="text-lg font-semibold">Downloads</p>
				<hr />
				<p>
					{packs.all.length > 0 ? pack.totalDownloadCount : pack.downloadCount}
				</p>
			</div>

			<div>
				<p class="text-lg font-semibold">License</p>
				<hr />
				<p>{pack.license}</p>
			</div>
		</div>

		{#if !hideButtons}
			<!-- TODO: Get the form message here. -->
			{#if form?.message}<p class="text-red-500">{form.message}</p>{/if}
			<div class="flex gap-4">
				<form
					action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/like"}
					method="post"
					use:enhance
				>
					<!-- TODO: These are glitchy on the card page. -->
					<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
						<ThumbsUp class={pack.likes.hasLiked ? "fill-green-400" : ""} />
						<p class="font-mono text-lg">{pack.likes.positive}</p>
					</button>
				</form>

				<form
					action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/dislike"}
					method="post"
					use:enhance
				>
					<!-- TODO: Get the form message here. -->
					<button type="submit" class="flex gap-1 mt-4 hover:cursor-pointer">
						<ThumbsDown class={pack.likes.hasDisliked ? "fill-red-400" : ""} />
						<p class="font-mono text-lg">{pack.likes.negative}</p>
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
