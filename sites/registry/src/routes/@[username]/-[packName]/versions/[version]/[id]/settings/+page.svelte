<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { satisfiesRole } from "$lib/user";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();
	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));

	let canEditPack = $derived(data.canEditPack);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));

	let approveConfirm = $state(0);
	let approveType = $state(true);

	let deleteVersionConfirm = $state(0);
	let deletePackConfirm = $state(0);

	let editOpen = $state(page.url.hash.startsWith("#edit"));
	let editPackOpen = $state(page.url.hash.startsWith("#edit-pack"));
	let editVersionOpen = $state(page.url.hash.startsWith("#edit-version"));
	let moderateOpen = $state(page.url.hash.startsWith("#moderate"));
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then packs}
	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	<!-- TODO: Use tabs instead of <details> -->

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
									{packs.current.approved ? "Unapprove" : "Approve"}
								</button>
							</div>
							{#if !packs.current.approved}
								<div class="flex bg-black text-white outline-1 -outline-offset-1 w-full">
									<button
										id="moderate-deny"
										class="px-5 py-3 w-full hover:cursor-pointer hover:bg-gray-800 active:bg-black target:outline"
										onclick={() => {
											approveConfirm++;
											approveType = false;
										}}
									>
										{packs.current.denied ? "Remove denial" : "Deny"}
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
									? packs.current.approved
										? "?/unapprove"
										: "?/approve"
									: packs.current.denied
										? "?/approve-deny-remove"
										: "?/approve-deny")}
							method="post"
							use:enhance
						>
							<div class="flex flex-col gap-1">
								<label class="flex flex-col">
									Message
									<textarea
										name="message"
										class="bg-background min-h-24 invalid:border-red-500"
										placeholder="Comment..."
										aria-invalid={$errors.message ? "true" : undefined}
										bind:value={$form.message}
										{...$constraints.message}
									></textarea>
									<p class="text-red-500">{$errors.message}</p>
								</label>

								<label class="flex flex-col">
									Message Type
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
									<p class="text-red-500">{$errors.messageType}</p>
								</label>

								<label class="flex flex-col">
									Karma
									<input
										name="karma"
										class="bg-background invalid:border-red-500"
										aria-invalid={$errors.karma ? "true" : undefined}
										bind:value={$form.karma}
										{...$constraints.karma}
									/>
									<p class="text-red-500">{$errors.karma}</p>
								</label>

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
												{packs.current.approved ? "Unapprove!" : "Approve!"}
											{:else}
												{packs.current.denied ? "Remove denial!" : "Deny!"}
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
{/await}
