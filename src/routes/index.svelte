<script lang="ts" context="module">
	import { getArguments } from '../supabase';
	import type { Argument, Party } from '../supabase';

	export async function load() {
		const allArguments = await getArguments();
		return { props: { allArguments } };
	}
</script>

<script lang="ts">
	import PartyInfo from '$lib/PartyInfo.svelte';
	import { hidePopup } from '../store';
	export let allArguments: Argument[];

	let showParty: {argument: number, party: string} = {argument: 0, party: ''};

	hidePopup.subscribe(v => {
		if (v) {
			showParty = {argument: 0, party: ''};
			hidePopup.set(false);
		}
	})

	const showHideParty = (party: Party, argument: Argument) => {
		showParty = {
			argument: argument.id,
			party: party.initial,
		}
	};
</script>

<div class="arguments">
	<h1>Political Side</h1>
	{#each Object.entries(allArguments) as [id, arg]}
		<div class="argument">
			<h2>{arg.title}</h2>
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

			.views {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

				.view {
					.parties {
						display: flex;
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
