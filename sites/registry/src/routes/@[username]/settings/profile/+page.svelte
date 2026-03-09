<script>
	import Section from "$lib/components/section.svelte";
	import { rolesEnum } from "$lib/db/schema.js";
	import { satisfiesRole } from "$lib/user.js";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const {
		form: profileForm,
		errors: profileErrors,
		constraints: profileConstraints,
		message: profileMessage,
		enhance: profileEnhance,
	} = $derived(superForm(data.profileForm));
	const {
		form: uploadAvatarForm,
		errors: uploadAvatarErrors,
		constraints: uploadAvatarConstraints,
		message: uploadAvatarMessage,
		enhance: uploadAvatarEnhance,
	} = $derived(superForm(data.uploadAvatarForm));
</script>

<Section>
	<form method="post" action="?/edit" class="flex flex-col gap-1 min-w-1/4" use:profileEnhance>
		{#if $profileMessage}<h3 class="text-red-500">{$profileMessage}</h3>{/if}
		{#if $profileErrors._errors}
			{#each $profileErrors._errors as error (error)}
				<span class="text-red-500 text-xl">{error}</span>
			{/each}
		{/if}

		<label for="aboutMe">About me</label>
		<textarea
			name="aboutMe"
			class="bg-background min-h-52"
			aria-invalid={$profileErrors.aboutMe ? "true" : undefined}
			bind:value={$profileForm.aboutMe}
			{...$profileConstraints.aboutMe}
		></textarea>
		{#if $profileErrors.aboutMe}<span class="text-red-500">{$profileErrors.aboutMe}</span>{/if}

		{#if $profileForm.type === "User"}
			<label for="pronouns">Pronouns</label>
			<input
				name="pronouns"
				class="bg-background"
				aria-invalid={$profileErrors.pronouns ? "true" : undefined}
				bind:value={$profileForm.pronouns}
				{...$profileConstraints.pronouns}
			/>
			{#if $profileErrors.pronouns}<span class="text-red-500">{$profileErrors.pronouns}</span>{/if}

			{#if satisfiesRole(data.user, "Admin")}
				<label for="role">Role</label>
				<select
					name="role"
					class="bg-background"
					aria-invalid={$profileErrors.role ? "true" : undefined}
					bind:value={$profileForm.role}
					{...$profileConstraints.role}
				>
					{#each rolesEnum.enumValues as role (role)}
						<option value={role} selected={data.user.role === role}>{role}</option>
					{/each}
				</select>
				{#if $profileErrors.role}<span class="text-red-500">{$profileErrors.role}</span>{/if}
			{/if}

			<input type="hidden" value="User" />
		{:else}
			<input type="hidden" value="Group" />
		{/if}

		<button class="custom-button p-2 rounded-none">Save</button>
	</form>
</Section>

<Section>
	<h1>Upload a Profile Picture</h1>
	<form
		method="post"
		action="?/uploadAvatar"
		enctype="multipart/form-data"
		class="flex flex-col gap-1"
		use:uploadAvatarEnhance
	>
		{#if $uploadAvatarMessage}<h3 class="text-red-500">{$uploadAvatarMessage}</h3>{/if}
		{#if $uploadAvatarErrors._errors}
			{#each $uploadAvatarErrors._errors as error (error)}
				<span class="text-red-500 text-xl">{error}</span>
			{/each}
		{/if}

		<input
			name="file"
			type="file"
			accept="image/*"
			aria-invalid={$uploadAvatarErrors.file ? "true" : undefined}
			oninput={(e) => {
				const file = e.currentTarget.files?.item(0);
				if (!file) {
					return;
				}

				$uploadAvatarForm.file = file;
			}}
			{...$uploadAvatarConstraints.file}
		/>
		{#if $uploadAvatarErrors.file}<span class="text-red-500">{$uploadAvatarErrors.file}</span>{/if}

		<button type="submit" class="custom-button w-fit p-2">Upload</button>
	</form>
</Section>
