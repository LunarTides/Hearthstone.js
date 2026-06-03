<script lang="ts">
	import PackBig from "$lib/components/pack-big.svelte";
	import Tab from "$lib/components/tab.svelte";
	import Tabs from "$lib/components/tabs.svelte";
	import { satisfiesRole } from "$lib/user";
	import {
		Circle,
		Cog,
		Component,
		FolderCode,
		Gamepad2,
		Hammer,
		Hexagon,
		History,
		Info,
		MessageSquare,
		Parentheses,
		Shapes,
	} from "lucide-svelte";
	import { superForm } from "sveltekit-superforms";

	let { data, form: rawForm, children } = $props();
	const { form } = $derived(superForm(data.form));

	let canEditPack = $derived(data.canEditPack);
	const canModeratePack = $derived(satisfiesRole(data.user, "Moderator"));
</script>

{#await data.formattedPacks}
	<p>Loading...</p>
{:then packs}
	<PackBig
		pack={packs.current}
		user={data.user}
		{form}
		{rawForm}
		individual
		showDownloadButton
		class="rounded-b-none"
	/>

	<Tabs>
		<Tab href="/@[username]/-[packName]/v[version]" strict>
			<Info />
			README
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/files">
			<FolderCode />
			Code
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/resources">
			<Shapes />
			{#await data.resources}
				Resources (...)
			{:then resources}
				Resources ({resources.length})
			{/await}
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/comments">
			<MessageSquare />
			<!-- TODO: Show amount of comments. -->
			Comments
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/versions">
			<History />
			Versions ({packs.all.length})
		</Tab>
		{#if canEditPack || canModeratePack}
			<Tab href="/@[username]/-[packName]/v[version]/settings">
				<Cog />
				Settings
			</Tab>
		{/if}
	</Tabs>
{/await}

{@render children()}
