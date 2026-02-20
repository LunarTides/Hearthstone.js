<script lang="ts">
	import type { ClientUser } from "$lib/server/auth";
	import type { GroupAndProfile } from "$lib/group";

	let {
		group,
		clientUser,
	}: {
		group: GroupAndProfile;
		clientUser: ClientUser;
	} = $props();

	const avatarPromise = import(`$lib/../../static/avatars/${group.username}.avif`).catch(() => {});
</script>

<div class="flex gap-1">
	<div class="p-3 bg-header text-white w-full rounded-lg">
		<div class="flex flex-col gap-1">
			<div class="flex gap-2">
				{#await avatarPromise}
					<div class="p-6 bg-white rounded-full size-12"></div>
				{:then avatar}
					<img alt="Avatar" class="size-12" src={avatar.default.split("/static")[1]} />
				{/await}

				<p class="text-xl self-center">{group.username}</p>
			</div>

			<pre class="text-wrap wrap-break-word">{group.profile.aboutMe}</pre>
		</div>
	</div>
</div>
