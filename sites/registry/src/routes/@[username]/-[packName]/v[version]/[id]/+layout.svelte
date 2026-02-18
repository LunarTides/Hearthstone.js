<script lang="ts">
	import PackBig from "$lib/components/pack-big.svelte";
	import Tab from "$lib/components/tab.svelte";
	import Tabs from "$lib/components/tabs.svelte";
	import { satisfiesRole } from "$lib/user";
	import { Cog, FolderCode, History, Info, MessageSquare, Parentheses } from "lucide-svelte";
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
		<Tab href="/@[username]/-[packName]/v[version]/[id]" strict>
			<Info />
			README
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/[id]/files">
			<FolderCode />
			Code
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/[id]/cards">
			<Parentheses />
			{#await data.cards}
				Cards (...)
			{:then cards}
				Cards ({cards.length})
			{/await}
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/[id]/comments">
			<MessageSquare />
			<!-- TODO: Show amount of comments. -->
			Comments
		</Tab>
		<Tab href="/@[username]/-[packName]/v[version]/[id]/versions">
			<History />
			Versions ({packs.all.length})
		</Tab>
		{#if canEditPack || canModeratePack}
			<Tab href="/@[username]/-[packName]/v[version]/[id]/settings">
				<Cog />
				Settings
			</Tab>
		{/if}
	</Tabs>
{/await}

{@render children()}
