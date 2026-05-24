// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightKbd from 'starlight-kbd';
import starlightBlog from 'starlight-blog';
// import starlightVersions from 'starlight-versions';

// https://astro.build/config
export default defineConfig({
	site: 'https://hs.lunartides.dev',
	integrations: [
		starlight({
			title: 'Hearthstone.js',
			favicon: 'favicon.png',
			logo: {
				src: './src/assets/logo.webp',
			},
			social: [
     	  { icon: 'seti:git', label: 'Source Code', href: 'https://git.lunartides.dev/LunarTides/Hearthstone.js' },
			  { icon: 'github', label: 'GitHub (Mirror)', href: 'https://github.com/LunarTides/Hearthstone.js' }
			],
			editLink: {
				baseUrl: 'https://git.lunartides.dev/LunarTides/Hearthstone.js/edit/main/sites/docs/',
			},
      customCss: [
        "./src/styles/global.css",
			],
			components: {
				SiteTitle: './src/overrides/SiteTitle.astro',
				ThemeSelect: './src/overrides/ThemeSelect.astro',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
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
							label: 'Create',
							items: [
  							{
  								label: 'Resource',
                  collapsed: true,
  								items: [
  									{ label: "Introduction", slug: 'guides/create/resource/introduction' },
  									{ label: 'IDs, UUIDs, and Names', slug: 'guides/create/resource/ids' },
  									{ label: 'Color Tags', slug: 'guides/create/resource/color-tags' },
  									{
  										label: 'Card',
  										items: [
   											{ label: "Introduction", slug: 'guides/create/resource/card/introduction' },
   											{ label: "Creating", slug: 'guides/create/resource/card/creating' },
                          {
       											label: 'Adding Logic',
       											items: [
        												{ label: 'The Blueprint', slug: 'guides/create/resource/card/logic/blueprint' },
        												{ label: 'Abilities', slug: 'guides/create/resource/card/logic/abilities' },
        												{ label: 'Card-to-Card Interaction', slug: 'guides/create/resource/card/logic/card-to-card' },
        												{ label: 'Game Modules', slug: 'guides/create/resource/card/logic/modules' },
        												{ label: 'Passives', slug: 'guides/create/resource/card/logic/passives' },
        												{
       													label: 'Concepts',
         													items: [
          														{ label: 'The Event System', slug: 'guides/create/resource/card/logic/concepts/event-system' },
         													],
        												},
       											],
      										},
  										],
  									},
  									{
  										label: 'Command',
  										items: [
   											{ label: "Introduction", slug: 'guides/create/resource/command/introduction' },
  										],
  									},
  									{
  										label: 'SFX',
  										items: [
   											{ label: "Introduction", slug: 'guides/create/resource/sfx/introduction' },
  										],
  									},
  									{
  										label: 'Packs',
  										items: [
  											{ label: 'Introduction', slug: 'guides/create/resource/packs/introduction' },
  											{ label: 'Exporting a Pack', slug: 'guides/create/resource/packs/export' },
  											{ label: 'Importing a Pack', slug: 'guides/create/resource/packs/import' },
  											{ label: 'Registry', slug: 'guides/create/resource/packs/registry' },
  										],
  									},
  								],
  							},
								{
									label: 'Deck',
									collapsed: true,
									items: [
										{ label: 'Using the Deck Creator', slug: 'guides/create/deck/use' },
										{ label: 'Commands', slug: 'guides/create/deck/commands' },
									],
								},
								{
									label: 'Class',
									collapsed: true,
									items: [
										{ label: 'Using the Class Creator', slug: 'guides/create/class/use' },
									],
								},
							],
						},
						{
							label: 'Sites',
							collapsed: true,
							items: [
								{
									label: 'Docs',
									items: [
										{ label: 'Introduction', slug: 'guides/sites/docs/introduction' },
										{ label: 'Self-Hosting', slug: 'guides/sites/docs/self-hosting' },
										{ label: 'Adding Content', slug: 'guides/sites/docs/adding-content' },
										{ label: 'Blog', slug: 'guides/sites/docs/blogs' },
									],
								},
								{
									label: 'Registry',
									items: [
										{ label: 'Introduction', slug: 'guides/sites/registry/introduction' },
										{ label: 'User Guide', slug: 'guides/sites/registry/user' },
										{ label: 'Moderator Guide', slug: 'guides/sites/registry/moderator' },
										{ label: 'Admin Guide', slug: 'guides/sites/registry/admin' },
										{ label: 'Self-Hosting', slug: 'guides/sites/registry/self-hosting' },
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
								{
									label: 'Game',
									items: [
										{ label: 'Explaining the Gameloop', slug: 'guides/contributing/game/gameloop' },
									],
								},
							],
						},
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
			plugins: [
				starlightKbd({
					types: [
						{ id: 'windows', label: "Windows", default: true },
						{ id: 'linux', label: "Linux" },
						{ id: 'mac', label: "Mac" },
					],
					globalPicker: false,
				}),
				starlightBlog({
					authors: {
						lunartides: {
							name: 'LunarTides',
							picture: 'https://avatars.githubusercontent.com/u/31688109?s=200',
							url: 'https://lunartides.dev',
						}
					},
					navigation: 'none',
					metrics: {
						readingTime: true,
					},
				}),
				// starlightVersions({
				// 	versions: [
				// 		{
				// 			slug: "v4",
				// 		}
				// 	]
				// }),
			],
		}),
	],
});
