<script lang="ts">
	import GroupMemberSmall from "$lib/components/group-member-small.svelte";

	const { data } = $props();
</script>

{#await data.members}
	<p>Loading...</p>
{:then members}
	<div class="flex flex-col gap-1 m-2">
		{#each members as member (member.username)}
			<GroupMemberSmall {member} clientUser={data.user} />
		{/each}
	</div>
{/await}
