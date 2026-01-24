<script lang="ts">
	import GroupMemberSmall from "$lib/components/group-member-small.svelte";

	const { data } = $props();
</script>

{#await data.currentMember}
	<p>Loading...</p>
{:then member}
	<div class="mx-2">
		<GroupMemberSmall {member} clientUser={data.user} navigateToUser />

		<p>Permissions: <strong>{member.permissions.join(", ")}</strong></p>
	</div>
{/await}
