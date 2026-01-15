<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Badge from "$lib/components/badge.svelte";
	import PackBig from "$lib/components/pack-big.svelte";
	import type { PackWithExtras } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user";
	import { Cog } from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data, children } = $props();
	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));

	// Some real typescript magic right here. Wow...
	let packs = $state<Promise<{ current: PackWithExtras; all: PackWithExtras[] }>>(
		Promise.resolve() as any,
	);

	let canEditPack = $state(false);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	let approveConfirm = $state(0);
	let approveType = $state(true);

	let deleteConfirm = $state(0);

	$effect(() => {
		(async () => {
			const ps = await data.packs;
			const found = ps.all.find((v) => v.id === page.params.id);
			if (!found) {
				// TODO: Error handling.
				return;
			}

			packs = Promise.resolve({ current: found, all: ps.all });
			canEditPack = found.userIds.includes(data.user?.id || "0");
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
		cards={{ all: data.cards! }}
		user={data.user}
		{form}
		showDownloadButton
		individual
		class="rounded-b-none"
	/>

	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	{#if canEditPack || canModeratePack}
		<div class="flex text-white">
			<a
				href={resolve("/pack/[uuid]/edit", { uuid: versions.current.uuid })}
				class="px-5 py-3 w-full text-center bg-red-400 hover:bg-red-300 active:bg-red-500"
			>
				Edit
			</a>
			<div class="border-l text-slate-700 ml-auto h-auto"></div>
			{#if deleteConfirm < 2}
				<button
					class="px-5 py-3 w-full hover:cursor-pointer bg-red-400 hover:bg-red-300 active:bg-red-500"
					onclick={() => {
						deleteConfirm++;
					}}
				>
					{#if deleteConfirm === 0}
						Delete Version
					{:else if deleteConfirm === 1}
						Really delete?
					{/if}
				</button>
			{:else}
				<!-- TODO: Use superforms. -->
				<form
					action={resolve("/pack/[uuid]/versions/[version]/[id]", {
						uuid: versions.current.uuid,
						version: versions.current.packVersion,
						id: versions.current.id,
					}) + "?/delete"}
					method="post"
					class="w-full"
					use:enhance
				>
					<button
						type="submit"
						class="px-5 py-3 w-full bg-red-500 hover:cursor-pointer hover:bg-red-400 active:bg-red-600"
					>
						<p>Really <em>REALLY</em> delete? You cannot undo this action.</p>
					</button>
				</form>
			{/if}
		</div>
	{/if}

	{#if canModeratePack}
		<!-- Approve -->
		{#if !versions.current.approved}
			<div class="flex flex-col m-2 gap-2">
				<h3 class="text-2xl">Approve</h3>
				{#if approveConfirm === 0}
					<div class="flex gap-1">
						<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
							<button
								class="px-5 py-3 w-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
								onclick={() => {
									approveConfirm++;
									approveType = true;
								}}
							>
								Approve
							</button>
						</div>
						<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
							<button
								class="px-5 py-3 w-full hover:cursor-pointer hover:bg-gray-800 active:bg-black"
								onclick={() => {
									approveConfirm++;
									approveType = false;
								}}
							>
								Deny
							</button>
						</div>
					</div>
				{:else}
					<form
						action={resolve("/pack/[uuid]/versions/[version]/[id]", {
							uuid: versions.current.uuid,
							version: versions.current.packVersion,
							id: versions.current.id,
						}) + (approveType ? "?/approve" : "?/approve-deny")}
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

							<div class="flex bg-black text-white outline-1 -outline-offset-1">
								<button
									type="submit"
									class="px-5 py-3 w-full text-center hover:cursor-pointer hover:bg-gray-800 active:bg-black"
								>
									{#if approveType}
										Approve!
									{:else}
										<!-- TODO: Make deny work. -->
										Deny!
									{/if}
								</button>
							</div>
						</div>
					</form>
				{/if}
			</div>
		{/if}
	{/if}

	<details class="m-2" open>
		<summary>Messages</summary>

		<!-- TODO: Add posting messages as Moderator+ -->

		<div class="flex flex-col gap-1">
			{#each versions.current.messages as message (message.id)}
				<div
					id={`message-${message.id}`}
					class="flex flex-col gap-2 p-2 bg-header rounded-xl text-white target:outline"
				>
					<div>
						<div class="flex gap-2">
							{#if message.author}
								<a href={resolve("/user/[uuid]", { uuid: message.author.id })} class="flex gap-2">
									<!-- TODO: Add avatar -->
									<div class="p-4 bg-white rounded-full"></div>
									<p class="text-lg self-center font-mono">{message.author.username}</p>
								</a>
								<div class="flex gap-1">
									{#if message.authorId === data.user?.id}
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
{/await}

{@render children()}
