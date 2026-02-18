<script lang="ts">
	import Tab from "$lib/components/tab.svelte";
	import Tabs from "$lib/components/tabs.svelte";
	import { CircleUserRound, KeyRound, Settings } from "lucide-svelte";

	let { children } = $props();
</script>

<Tabs>
	<Tab href="/@[username]/settings/account">
		<Settings />
		Account
	</Tab>
	<Tab href="/@[username]/settings/profile">
		<CircleUserRound />
		Profile
	</Tab>
	<Tab href="/@[username]/settings/auth">
		<KeyRound />
		Authentication
	</Tab>
</Tabs>

{@render children()}
