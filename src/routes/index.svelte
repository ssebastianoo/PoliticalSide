<script lang="ts" context="module">
	import { getArguments } from '../supabase';
	import type { Argument, Arguments, Party } from '../supabase';

	export async function load() {
		const allArguments = await getArguments();
		return { props: { allArguments } };
	}
</script>

<script lang="ts">
	import PartyInfo from '$lib/PartyInfo.svelte';
	import { hidePopup } from '../store';
	export let allArguments: Arguments;
	let results: Arguments = allArguments;

	let showParty: { argument: number; party: string } = { argument: 0, party: '' };

	hidePopup.subscribe((v) => {
		if (v) {
			showParty = { argument: 0, party: '' };
			hidePopup.set(false);
		}
	});

	const showHideParty = (party: Party, argument: Argument) => {
		showParty = {
			argument: argument.id,
			party: party.initial
		};
	};

	// haha, typescript
	const objectFilter = (obj: any, predicate: Function) => {
		Object.keys(obj)
			.filter((key: any) => predicate(obj[key]))
			.reduce((res: any, key: any) => ((res[key] = obj[key]), res), {});
	};

	const handleSearch = (e: KeyboardEvent) => {
		const target = e.target as HTMLInputElement;

		if (target.value.trim() === '') {
			console.log('empty');
			results = allArguments;
		} else {
			results = {};
			for (const arg in allArguments) {
				if (
					allArguments[arg].title.toLowerCase().replace(' ', '').trim().includes(target.value.toLowerCase().replace(' ', '').trim())
				) {
					results[arg] = allArguments[arg];
				}
			}
		}
	};
</script>

<div class="arguments">
	<h1>Political Side</h1>
	<input type="text" placeholder="Cerca..." class="search" on:keyup={handleSearch} />
	{#each Object.entries(results) as [id, arg]}
		<div class="argument">
			<h2 id={id} class="argument-title"><a href={"#" + id}>{arg.title}</a></h2>
			<p>{arg.description}</p>

			<div class="views">
				{#each Object.entries(arg.parties) as [view, parties]}
					{#if parties.length > 0}
						<div class="view">
							<h3>{{ agrees: "D'accordo", disagrees: 'Disaccordo', neutral: 'Neutrale' }[view]}</h3>
							<div class="parties">
								{#each parties as party}
									{#if showParty.argument === arg.id && showParty.party === party.initial}
										<PartyInfo {party} />
									{/if}
									<img
										src={party.logo}
										alt={party.name + "'s logo"}
										width="50"
										height="50"
										on:click={() => {
											showHideParty(party, arg);
										}}
									/>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<hr />
	{/each}
</div>

<style lang="scss">

	.search {
		all: unset;
		padding: 2px;

		&:focus {
			border-bottom: 1px solid $color2;
			margin-bottom: -1px;
		}
	}

	.arguments {
		display: flex;
		flex-direction: column;
		align-items: center;

		hr {
			width: 85vw;
			max-width: 500px;
			margin-top: 30px;
		}

		.argument {
			width: 85vw;
			max-width: 500px;

			.argument-title {
				a {
					color: unset;
				}
			}

			.views {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

				.view {
					.parties {
						display: flex;
						flex-wrap: wrap;
						gap: 2px;

						img {
							border-radius: 50%;
							cursor: pointer;
						}
					}
				}
			}
		}
	}
</style>
