<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import cardboard from "$lib/assets/cardboard-texture.avif";
	import { goto } from "$app/navigation";

	let { pack, all = [], user, hideButtons = false } = $props();

	let canModeratePack = $derived(pack.userIds.includes(user?.id || "0"));
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
	<!-- TODO: Add downloads. -->

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

		<!-- TODO: Make this work. -->
		<div>
			<p class="text-lg font-semibold">Unpacked Size</p>
			<hr />
			<p>0kb</p>
		</div>

		<div>
			<p class="text-lg font-semibold">License</p>
			<hr />
			<p>{pack.license}</p>
		</div>
	</div>
</div>
