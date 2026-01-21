<script lang="ts">
	import { resolve } from "$app/paths";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const { form, errors, constraints, message, enhance } = $derived(superForm(data.form));
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

	<div class="p-2 mx-1 bg-header w-fit rounded-md">
		<div class="flex gap-1">
			<p>Want to upload a pack?</p>
			<a href={resolve("/upload/rules")} class="underline">Check out the rules.</a>
		</div>

		<p>Dont worry, they are easily understandable :)</p>
	</div>

	<button type="submit" class="custom-button w-fit p-2">Submit</button>
</form>
