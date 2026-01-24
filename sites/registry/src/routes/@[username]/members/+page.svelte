<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import GroupMemberSmall from "$lib/components/group-member-small.svelte";
	import { UserRoundPlus } from "lucide-svelte";

	const { data } = $props();
</script>

<a
	href={resolve("/@[username]/members/new", { username: page.params.username! })}
	class="flex min-w-77.5 m-2 p-2 bg-header gap-1 w-fit rounded-md transition-all hover:scale-105 hover:drop-shadow-2xl"
>
	<UserRoundPlus class="size-7.5" />
	<p class="text-lg">Invite Member</p>
</a>

{#await data.members}
	<p>Loading...</p>
{:then members}
	<div class="flex flex-col gap-1 m-2">
		{#each members as member (member.username)}
			<GroupMemberSmall {member} clientUser={data.user} />
		{/each}
	</div>
{/await}
