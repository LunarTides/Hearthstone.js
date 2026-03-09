<script lang="ts">
	const {
		username,
		classNoAvatar,
		classAvatar,
	}: { username: string | undefined | null; classNoAvatar?: string; classAvatar?: string } =
		$props();
</script>

<img
	alt="Avatar"
	class={`rounded-full ${classAvatar ? classAvatar : "size-10"}`}
	src={`/registry/avatars/${username}.avif`}
	onerror={(event) => {
		event.currentTarget.outerHTML = `<div class="p-5 bg-white rounded-full ${classNoAvatar}"></div>`;
	}}
/>
