<script lang="ts">
	import { RefreshCw, Trash2 } from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data } = $props();

	const {
		form: createTokenForm,
		errors: createTokenErrors,
		constraints: createTokenConstraints,
		message: createTokenMessage,
		enhance: createTokenEnhance,
	} = $derived(superForm(data.createTokenForm));
</script>

<h1>Authentication</h1>

<p>TODO</p>
<p>Change password</p>

<p>2-Factor Auth</p>

<h2>Gradual Tokens</h2>
<div class="flex flex-col gap-1 m-1 p-2 bg-header">
	{#each data.tokens as token (token.id)}
		<div class="p-2 bg-background">
			<div class="float-right">
				<!-- TODO: Make these work. -->
				<button class="" title="Refresh Token">
					<RefreshCw />
				</button>
				<button class="" title="Delete Token">
					<Trash2 />
				</button>
			</div>

			<p class="font-mono">{token.id}</p>
			<p>{token.permissions.toSorted((a, b) => a.localeCompare(b)).join(", ")}</p>
		</div>
	{/each}

	{#if $createTokenMessage}
		{#if $createTokenMessage.startsWith("msg:")}
			<h3 class="text-green-500">{$createTokenMessage.slice("msg:".length)}</h3>
		{:else}
			<h3 class="text-red-500">{$createTokenMessage}</h3>
		{/if}
	{/if}

	<form
		method="post"
		action="?/createToken"
		class="flex flex-col gap-1 min-w-1/4"
		use:createTokenEnhance
	>
		{#if $createTokenErrors._errors}
			{#each $createTokenErrors._errors as error (error)}
				<span class="text-red-500 text-xl">{error}</span>
			{/each}
		{/if}

		<!-- TODO: Make this better. -->
		<label for="permissions">Permissions</label>
		<textarea
			name="permissions"
			class="bg-background min-h-52"
			aria-invalid={$createTokenErrors.permissions ? "true" : undefined}
			bind:value={$createTokenForm.permissions}
			{...$createTokenConstraints.permissions}
		></textarea>
		{#if $createTokenErrors.permissions}<span class="text-red-500"
				>{$createTokenErrors.permissions}</span
			>{/if}

		<button class="custom-button p-2 rounded-none">Save</button>
	</form>
</div>
