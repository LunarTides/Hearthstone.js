<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Badge from "$lib/components/badge.svelte";
	import CardSmall from "$lib/components/card-small.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user";
	import { Cog } from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data, form: rawForm, children } = $props();
	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));

	// Some real typescript magic right here. Wow...
	let packs = $state<
		Promise<{ current: PackWithExtras; latest: PackWithExtras; all: PackWithExtras[] }>
	>(Promise.resolve() as any);

	let canEditPack = $state(false);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	let approveConfirm = $state(0);
	let approveType = $state(true);

	let deleteVersionConfirm = $state(0);
	let deletePackConfirm = $state(0);

	let editOpen = $state(page.url.hash.startsWith("#edit"));
	let editPackOpen = $state(page.url.hash.startsWith("#edit-pack"));
	let editVersionOpen = $state(page.url.hash.startsWith("#edit-version"));
	let versionsOpen = $state(page.url.hash.startsWith("#version"));
	let moderateOpen = $state(page.url.hash.startsWith("#moderate"));
	let detailsOpen = $state(true);
	let cardsOpen = $state(page.url.hash.startsWith("#card"));
	let messagesOpen = $state(page.url.hash.startsWith("#message"));

	$effect(() => {
		(async () => {
			const ps = await data.packs;
			const found = ps.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, latest: ps.latest, all: ps.all });
			canEditPack = found.ownerName === data.user?.username;
		})();
	});
</script>

{#await packs}
	<p>Loading...</p>
{:then versions}
	<PackBig
		packs={{
			...versions,
			latest: versions.all.find((v) => v.isLatestVersion)!,
		}}
		user={data.user}
		{form}
		{rawForm}
		individual
		class="rounded-b-none"
	/>

	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	<!-- Edit -->
	{#if canEditPack || canModeratePack}
		<div class="m-1 p-2 bg-header rounded-md">
			<details bind:open={editOpen}>
				<summary class="text-red-500">Edit</summary>
				<div class="m-1 p-2 bg-background rounded-md">
					<details bind:open={editPackOpen}>
						<summary>Pack</summary>
						<div class="flex m-2 gap-1">
							{#if deletePackConfirm < 2}
								<button
									id="edit-pack-delete"
									class="px-5 py-3 w-full text-center bg-red-400 hover:bg-red-300 active:bg-red-500 target:outline"
									onclick={() => {
										deletePackConfirm++;

										if (deletePackConfirm > 1) {
											deleteVersionConfirm = 0;
										}
									}}
								>
									{#if deletePackConfirm === 0}
										Delete Pack
									{:else if deletePackConfirm === 1}
										Really delete?
									{/if}
								</button>
							{:else}
								<!-- TODO: Use superforms. -->
								<form
									id="edit-pack-delete"
									action={resolve("/@[username]/-[packName]", {
										username: page.params.username!,
										packName: page.params.packName!,
									}) + "?/delete"}
									method="post"
									class="w-full target:outline"
									use:enhance
								>
									<button
										type="submit"
										class="p-5 w-full text-xl right-0 bottom-0 absolute bg-red-500 text-white hover:animate-pulse hover:cursor-pointer active:animate-none active:bg-red-600"
									>
										<p>
											Really <em>REALLY</em> delete this <strong>PACK</strong>? You cannot undo this
											action.
										</p>
									</button>
								</form>
							{/if}
						</div>
					</details>
				</div>
				<div class="m-1 p-2 bg-background rounded-md">
					<details bind:open={editVersionOpen}>
						<summary>Version</summary>
						<div class="flex m-2 gap-1">
							{#if deleteVersionConfirm < 2}
								<button
									id="edit-version-delete"
									class="px-5 py-3 w-full text-center bg-red-400 hover:bg-red-300 active:bg-red-500 target:outline"
									onclick={() => {
										deleteVersionConfirm++;

										if (deleteVersionConfirm > 1) {
											deletePackConfirm = 0;
										}
									}}
								>
									{#if deleteVersionConfirm === 0}
										Delete Version
									{:else if deleteVersionConfirm === 1}
										Really delete?
									{/if}
								</button>
							{:else}
								<!-- TODO: Use superforms. -->
								<form
									id="edit-version-delete"
									action={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
										username: page.params.username!,
										packName: page.params.packName!,
										version: page.params.version!,
										id: page.params.id!,
									}) + "?/delete"}
									method="post"
									class="w-full target:outline"
									use:enhance
								>
									<button
										type="submit"
										class="p-5 w-full text-xl right-0 bottom-0 absolute bg-red-500 text-white hover:animate-pulse hover:cursor-pointer active:animate-none active:bg-red-600"
									>
										<p>Really <em>REALLY</em> delete this version? You cannot undo this action.</p>
									</button>
								</form>
							{/if}
						</div>
					</details>
				</div>
			</details>
		</div>
	{/if}

	<!-- Moderate -->
	{#if canModeratePack}
		<div class="m-1 p-2 bg-header rounded-md">
			<details bind:open={moderateOpen}>
				<summary class="text-indigo-500">Moderate</summary>
				<!-- Approve -->
				<div class="flex flex-col m-2 gap-2">
					<h3 class="text-2xl">Approve</h3>
					{#if approveConfirm === 0}
						<div class="flex gap-1">
							<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
								<button
									id="moderate-approve"
									class="px-5 py-3 w-full hover:cursor-pointer hover:bg-gray-800 active:bg-black target:outline"
									onclick={() => {
										approveConfirm++;
										approveType = true;
									}}
								>
									{versions.current.approved ? "Unapprove" : "Approve"}
								</button>
							</div>
							{#if !versions.current.approved}
								<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
									<button
										id="moderate-deny"
										class="px-5 py-3 w-full hover:cursor-pointer hover:bg-gray-800 active:bg-black target:outline"
										onclick={() => {
											approveConfirm++;
											approveType = false;
										}}
									>
										{versions.current.denied ? "Remove denial" : "Deny"}
									</button>
								</div>
							{/if}
						</div>
					{:else}
						<form
							action={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
								username: page.params.username!,
								packName: page.params.packName!,
								version: page.params.version!,
								id: page.params.id!,
							}) +
								(approveType
									? versions.current.approved
										? "?/unapprove"
										: "?/approve"
									: versions.current.denied
										? "?/approve-deny-remove"
										: "?/approve-deny")}
							method="post"
							use:enhance
						>
							<div class="flex flex-col gap-1">
								<textarea
									name="message"
									class="bg-background min-h-24 invalid:border-red-500"
									placeholder="Comment..."
									aria-invalid={$errors.message ? "true" : undefined}
									bind:value={$form.message}
									{...$constraints.message}
								></textarea>

								<select
									name="messageType"
									class="bg-background invalid:border-red-500"
									aria-invalid={$errors.messageType ? "true" : undefined}
									bind:value={$form.messageType}
									{...$constraints.messageType}
								>
									<option value="public">Public</option>
									<option value="internal">Internal</option>
								</select>

								<div class="flex gap-1">
									<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
										<button
											type="button"
											class="px-5 py-3 w-full text-center hover:cursor-pointer hover:bg-gray-800 active:bg-black"
											onclick={() => {
												approveConfirm = 0;
											}}
										>
											Cancel
										</button>
									</div>
									<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
										<button
											type="submit"
											class="px-5 py-3 w-full text-center hover:cursor-pointer hover:bg-indigo-600 active:bg-black"
										>
											{#if approveType}
												{versions.current.approved ? "Unapprove!" : "Approve!"}
											{:else}
												{versions.current.denied ? "Remove denial!" : "Deny!"}
											{/if}
										</button>
									</div>
								</div>
							</div>
						</form>
					{/if}
				</div>
			</details>
		</div>
	{/if}

	<!-- Versions -->
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={versionsOpen}>
			<summary>Versions ({versions.all.length})</summary>
			<div class="m-1 flex flex-col gap-2">
				<a
					id="version-latest"
					class="bg-background p-2 text-center rounded-full text-xl text-white target:outline-1"
					href={resolve("/@[username]/-[packName]", {
						username: versions.latest.ownerName,
						packName: versions.latest.name,
					})}
				>
					Latest
					<span class="text-gray-700">({versions.latest.id.split("-").at(-1)!.slice(0, 6)})</span>
				</a>

				<hr class="border" style="border-color: var(--color-background);" />

				{#each versions.all.toSorted( (a, b) => b.packVersion.localeCompare(a.packVersion), ) as pack (pack.id)}
					<a
						id={`version-${pack.id}`}
						href={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
							username: pack.ownerName,
							packName: pack.name,
							version: pack.packVersion,
							id: pack.id,
						})}
						class="bg-background p-2 rounded-full text-xl text-center text-white target:outline-1"
					>
						{pack.packVersion}
						<span class="text-gray-700">({pack.id.split("-").at(-1)!.slice(0, 6)})</span>
					</a>
				{/each}
			</div>
		</details>
	</div>

	<!-- Actions -->
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={detailsOpen}>
			<summary>Actions</summary>
			<div class="flex m-2 gap-1">
				<form
					id="action-download"
					action={resolve("/@[username]/-[packName]/versions/[version]/[id]", {
						username: page.params.username!,
						packName: page.params.packName!,
						version: page.params.version!,
						id: page.params.id!,
					}) + "?/download"}
					method="post"
					class="w-full target:outline"
					use:enhance
				>
					{#if versions.current.approved}
						<button
							type="submit"
							class="px-5 py-3 w-full bg-indigo-500 hover:cursor-pointer hover:bg-indigo-400 active:bg-indigo-600"
						>
							Download
						</button>
					{:else}
						<button
							class="px-5 py-3 w-full bg-indigo-700 hover:cursor-not-allowed"
							title="This pack has not been approved."
							disabled
						>
							Download
						</button>
					{/if}
				</form>
			</div>
		</details>
	</div>

	<!-- Cards -->
	{#await data.cards}
		<p>Loading...</p>
	{:then cards}
		<div class="m-1 p-2 bg-header rounded-md">
			<details bind:open={cardsOpen}>
				<summary>Cards ({cards.length})</summary>
				<div class="flex flex-wrap gap-1 mt-2">
					<!-- TODO: This doesn't show cards in not-approved versions. -->
					{#each cards as card (card.id)}
						<CardSmall {card} pack={versions.current} />
					{/each}
				</div>
			</details>
		</div>
	{/await}

	<!-- Messages -->
	<div class="m-1 p-2 bg-header rounded-md">
		<details bind:open={messagesOpen}>
			<summary>Messages ({versions.current.messages.length})</summary>

			<!-- TODO: Add posting messages as Moderator+ -->

			<div class="flex flex-col gap-1">
				{#each versions.current.messages as message (message.id)}
					<div
						id={`message-${message.id}`}
						class="flex flex-col gap-2 p-2 bg-background rounded-xl text-white target:outline"
					>
						<div>
							<div class="flex gap-2">
								{#if message.author}
									<a
										href={resolve("/@[username]", { username: message.author.username })}
										class="flex gap-2"
									>
										<!-- TODO: Add avatar -->
										<div class="p-4 bg-white rounded-full"></div>
										<p class="text-lg self-center font-mono">{message.author.username}</p>
									</a>
									<div class="flex gap-1">
										{#if message.username === data.user?.username}
											<Badge class="bg-indigo-300 h-fit self-center text-black">You</Badge>
										{/if}
										{#if satisfiesRole(message.author, "Moderator")}
											<Badge class="bg-blue-200 h-fit self-center text-black">
												{message.author.role}
											</Badge>
										{/if}
									</div>
									{#if message.type !== "public"}
										<p class="text-lg self-center font-mono bg-background py-0.5 px-2 rounded-full">
											{message.type[0].toUpperCase() + message.type.slice(1)}
										</p>
									{/if}
								{:else}
									<div class="flex gap-2">
										<Cog class="size-7" />
										<p class="text-lg self-center font-mono">System</p>
									</div>
									<Badge class="bg-indigo-400 h-fit self-center text-black">System</Badge>
								{/if}
							</div>
						</div>

						<pre class="font-sans">{message.text}</pre>
						<p class="text-gray-600">{message.creationDate.toLocaleString()}</p>
					</div>
				{/each}
			</div>
		</details>
	</div>
{/await}

{@render children()}
