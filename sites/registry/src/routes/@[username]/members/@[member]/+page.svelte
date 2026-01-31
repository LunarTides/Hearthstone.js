<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import GroupMemberSmall from "$lib/components/group-member-small.svelte";

	const { data } = $props();
	const { errors, message, enhance } = $derived(superForm(data.form));
</script>

{#await data.currentMember}
	<p>Loading...</p>
{:then member}
	<div class="mx-2">
		<GroupMemberSmall {member} clientUser={data.user} navigateToUser />

		<p>Permissions: <strong>{member.permissions.join(", ")}</strong></p>

		{#if data.isInvited}
      <!-- TODO: Add denying invites. -->
			<form
				action="?/acceptInvite"
				method="post"
				class="flex flex-col gap-1 w-fit mt-2"
				use:enhance
			>
				{#if $message}<h3 class="text-red-500">{$message}</h3>{/if}
				{#if $errors._errors}
					{#each $errors._errors as error (error)}
						<span class="text-red-500 text-xl">{error}</span>
					{/each}
				{/if}

				<button class="custom-button p-2 rounded-none">Accept Invite</button>
			</form>
		{/if}
	</div>
{/await}
