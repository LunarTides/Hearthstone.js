<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { goto } from "$app/navigation";
	import { type PackWithExtras } from "$lib/db/schema";
	import { ThumbsDown, ThumbsUp } from "lucide-svelte";
	import { enhance } from "$app/forms";

	let {
		pack,
		all = [],
		user,
		hideButtons = false,
		form,
	}: {
		pack: PackWithExtras;
		all?: PackWithExtras[];
		user: any;
		hideButtons?: boolean;
		form: any;
	} = $props();

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

<!-- TODO: Deduplicate code between this and the search page. -->
<div
	class="rounded-xl rounded-t-none p-7 bg-cover bg-gray-300 bg-blend-multiply text-white"
	style={`background-image: url(${cardboard});`}
>
	<h1 class="text-xl font-bold">{pack.name}</h1>
	<!-- TODO: Add clicking on the author if they have a connected account. -->
	<p class="font-semibold">({pack.authors.join(", ")})</p>
	{#if canModeratePack}
		<!-- TODO: Localize. -->
		<p class="text-green-300">You can administrate this pack.</p>
	{/if}

	<p class="mt-4">{pack.description}</p>

	{#if !hideButtons}
		<!-- TODO: Don't use absolute? -->
		<div
			class="absolute right-10 top-28 flex m-2 mt-4 w-fit bg-blue-300 drop-shadow-2xl rounded-full outline-1 outline-black"
		>
			<button
				class="px-5 py-3 text-black rounded-full rounded-r-none hover:cursor-pointer hover:bg-cyan-200 active:bg-blue-400"
				onclick={() => goto(resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! }))}
			>
				Download
			</button>
			<div class="border-l ml-auto h-auto text-black"></div>
			<button
				class="px-5 py-3 text-black hover:cursor-pointer hover:bg-cyan-200 active:bg-blue-400"
				onclick={() => goto(resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! }))}
			>
				Versions ({all.length})
			</button>
			<div class="border-l ml-auto h-auto text-black"></div>
			<!-- TODO: Show amount of cards. -->
			<button
				class="px-5 py-3 text-black rounded-full rounded-l-none hover:cursor-pointer hover:bg-cyan-200 active:bg-blue-400"
				onclick={() => goto(resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! }))}
			>
				Cards (0)
			</button>
		</div>
	{/if}

	<!-- TODO: Add links. -->

	<div class="flex mt-4 space-x-2">
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
				{all.length > 0 ? pack.totalDownloadCount : pack.downloadCount}
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
		<div class="flex space-x-4">
			<form
				action={resolve("/pack/[uuid]", { uuid: pack.uuid }) + "?/like"}
				method="post"
				use:enhance
			>
				<button type="submit" class="flex space-x-1 mt-4 hover:cursor-pointer">
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
				<button type="submit" class="flex space-x-1 mt-4 hover:cursor-pointer">
					<ThumbsDown class={pack.likes.hasDisliked ? "fill-red-400" : ""} />
					<p class="font-mono text-lg">{pack.likes.negative}</p>
				</button>
			</form>
		</div>
	{/if}
</div>
