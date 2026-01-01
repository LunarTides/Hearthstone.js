// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightKbd from 'starlight-kbd';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Hearthstone.js Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/LunarTides/Hearthstone.js' }],
			editLink: {
				baseUrl: 'https://github.com/LunarTides/Hearthstone.js/edit/main/sites/docs/',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
						{ label: 'Introduction', slug: 'guides/introduction' },
						{ label: 'Installing & Updating', slug: 'guides/installation' },
						{
							label: 'Playing',
							items: [
								{ label: 'Starting a Game', slug: 'guides/game/start' },
								{ label: 'Game Loop', slug: 'guides/game/gameloop' },
								{ label: 'Commands', slug: 'guides/game/commands' },
								{ label: 'Settings', slug: 'guides/game/settings' },
							],
						},
						{
							label: 'Creating',
							collapsed: true,
							items: [
								{
									label: 'Decks',
									items: [
										{ label: 'Using the Deck Creator', slug: 'guides/creating-decks/use' },
										{ label: 'Commands', slug: 'guides/creating-decks/commands' },
									],
								},
								{
									label: 'Cards',
									items: [
										{
											label: 'Generators',
											items: [
												{ label: 'Custom', slug: 'guides/creating-cards/generators/custom' },
												{ label: 'Vanilla', slug: 'guides/creating-cards/generators/vanilla' },
											],
										},
										{
											label: 'Adding Logic',
											items: [
												{ label: 'The Blueprint', slug: 'guides/creating-cards/logic/blueprint' },
												{ label: 'Abilities', slug: 'guides/creating-cards/logic/abilities' },
											],
										},
										{ label: 'IDs, UUIDs, and Names', slug: 'guides/creating-cards/ids' },
										{
											label: 'Packaging',
											items: [
												{ label: 'Exporting a Pack', slug: 'guides/creating-cards/packs/export' },
												{ label: 'Importing a Pack', slug: 'guides/creating-cards/packs/import' },
												{ label: 'Registry Website', slug: 'guides/creating-cards/packs/web' },
											],
										},
									],
								},		
							],
						},
						{
							label: 'Contributing',
							items: [
								{ label: 'FAQ', slug: 'guides/contributing/faq' },
								{ label: 'Project Structure', slug: 'guides/contributing/structure' },
								{ label: 'Tests', slug: 'guides/contributing/tests' },
							],
						},
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
			plugins: [
				starlightKbd({
					types: [
						{ id: 'windows', label: "Windows", default: true },
						{ id: 'linux', label: "Linux" },
						{ id: 'mac', label: "Mac" },
					],
				}),
			],
		}),
	],
	base: '/docs/',
});
