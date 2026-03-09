<script lang="ts">
	const {
		username,
		classNoAvatar,
		classAvatar,
	}: { username: string | undefined | null; classNoAvatar?: string; classAvatar?: string } =
		$props();

	const avatarPromise = $derived(
		import(`$lib/../../static/avatars/${username}.avif`).catch(() => {}),
	);
</script>

{#await avatarPromise}
	<div class={`p-5 bg-white rounded-full ${classNoAvatar}`}></div>
{:then avatar}
	<img
		alt="Avatar"
		class={`rounded-full ${classAvatar ? classAvatar : "size-10"}`}
		src={`/registry${avatar.default.split("/static")[1]}`}
	/>
{/await}
