<script lang="ts">
	import { resolve } from "$app/paths";
	import { m } from "$lib/paraglide/messages.js";
	import { page } from "$app/state";
	import cardboard from "$lib/assets/cardboard-texture.avif";

	let { data } = $props();

	let canModeratePack = $state(false);

	$effect(() => {
		data.packs.then((packs) => {
			canModeratePack = packs.latest.userIds.includes(data.user?.id || "0");
		});
	});
</script>

{#await data.packs}
	<p>{m.tidy_fancy_mule_prosper()}</p>
{:then packs}
	<!-- TODO: Deduplicate code between this and the search page. -->
	<div
		class="rounded-xl rounded-t-none p-7 bg-cover bg-gray-300 bg-blend-multiply text-white"
		style={`background-image: url(${cardboard});`}
	>
		<h1 class="text-xl font-bold">{packs.latest.name}</h1>
		<!-- TODO: Add clicking on the author if they have a connected account. -->
		<p class="font-semibold">({packs.latest.authors.join(", ")})</p>
		{#if canModeratePack}
			<p class="text-green-300">You can administrate this pack.</p>
		{/if}

		<p class="mt-4">{packs.latest.description}</p>

		<!-- TODO: Don't use absolute? -->
		<div
			class="absolute right-10 top-28 flex m-2 mt-4 p-3 w-fit backdrop-blur-xs rounded-full outline-1 outline-black"
		>
			<a
				href={resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! })}
				class="p-2 text-blue-800 underline underline-offset-2 rounded-full">Download</a
			>
			<div class="border-l ml-auto h-10 text-black"></div>
			<a
				href={resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! })}
				class="p-2 text-blue-800 underline underline-offset-2 rounded-full"
				>Versions ({packs.all.length})</a
			>
			<div class="border-l ml-auto h-10 text-black"></div>
			<!-- TODO: Show amount of cards. -->
			<a
				href={resolve("/pack/[uuid]/versions", { uuid: page.params.uuid! })}
				class="p-2 text-blue-800 underline underline-offset-2 rounded-full">Cards (0)</a
			>
		</div>

		<!-- TODO: Add links. -->
		<!-- TODO: Add downloads. -->

		<div class="flex mt-4 space-x-2">
			<div>
				<p class="text-lg font-semibold">Pack Version</p>
				<hr />
				<p>{packs.latest.packVersion}</p>
			</div>

			<div>
				<p class="text-lg font-semibold">Game Version</p>
				<hr />
				<p>{packs.latest.gameVersion}</p>
			</div>

			<!-- TODO: Make this work. -->
			<div>
				<p class="text-lg font-semibold">Unpacked Size</p>
				<hr />
				<p>0kb</p>
			</div>

			<div>
				<p class="text-lg font-semibold">License</p>
				<hr />
				<p>{packs.latest.license}</p>
			</div>
		</div>
	</div>

	<!-- <pre>{JSON.stringify(packs, null, 4)}</pre> -->
{/await}
