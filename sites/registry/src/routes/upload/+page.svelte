<script lang="ts">
	import { resolve } from "$app/paths";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));

	const fileName = $derived($form.file ? ($form.file as File).name : "");
	const ownerName = $derived(fileName.split("+")[0]);
	const packName = $derived(fileName.split("+")[1]?.split(".").slice(0, -2) ?? "");
</script>

<p>Upload</p>

<form method="post" enctype="multipart/form-data" class="flex flex-col gap-1" use:enhance>
	{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
	{#if $errors._errors}
		{#each $errors._errors as error (error)}
			<span class="text-red-500 text-xl">{error}</span>
		{/each}
	{/if}

	<input
		name="file"
		type="file"
		accept=".tar.gz"
		aria-invalid={$errors.file ? "true" : undefined}
		oninput={(e) => ($form.file = e.currentTarget.files?.item(0) as File)}
		{...$constraints.file}
	/>
	{#if $errors.file}<span class="text-red-500">{$errors.file}</span>{/if}

	<div>
		{#if $errors.ownerName}<span class="text-red-500">{$errors.ownerName}</span>{/if}
		{#if $errors.packName}<span class="text-red-500">{$errors.packName}</span>{/if}

		<div class="flex bg-header p-2 w-fit gap-1 *:self-center">
			<p class="text-2xl">@</p>
			<select
				name="ownerName"
				class="bg-background"
				aria-invalid={$errors.ownerName ? "true" : undefined}
				{...$constraints.ownerName}
				required={false}
			>
				<option selected={ownerName === data.user?.username}>{data.user?.username}</option>
				{#each data.validGroups as group (group.username)}
					<option selected={ownerName === group.username}>{group.username}</option>
				{/each}
			</select>
			<p class="text-2xl">/</p>
			<input
				name="packName"
				type="text"
				placeholder="Name"
				defaultValue={packName}
				class="bg-background"
				aria-invalid={$errors.packName ? "true" : undefined}
				{...$constraints.packName}
			/>
		</div>
	</div>

	<div class="p-2 mx-1 bg-header w-fit rounded-md">
		<div class="flex gap-1">
			<p>Want to upload a pack?</p>
			<a href={resolve("/upload/rules")} class="underline">Check out the rules.</a>
		</div>

		<p>Dont worry, they are easily understandable :)</p>
	</div>

	<button type="submit" class="custom-button w-fit p-2">Upload</button>
</form>
