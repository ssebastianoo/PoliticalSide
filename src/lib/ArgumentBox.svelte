<script lang="ts">
	import type { Argument, Party } from '../supabase';
	import { hidePopup, copiedPopup } from '../store';
	import PartyInfo from './PartyInfo.svelte';

	export let arg: Argument;

	let showParty: { argument: string; party: string } = { argument: '', party: '' };

	hidePopup.subscribe((v) => {
		if (v) {
			showParty = { argument: '', party: '' };
			hidePopup.set(false);
		}
	});

	const showHideParty = (party: Party, argument: Argument) => {
		showParty = {
			argument: argument.id,
			party: party.initial
		};
	};

	const copyToClipboard = (e: MouseEvent) => {
		const target = e.target as HTMLInputElement;
		const textarea = document.createElement('textarea');
		textarea.value = location.protocol + '//' + location.host + '/#' + target.parentElement?.id;
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		textarea.remove();
		copiedPopup.set(true);
	};
</script>

<div class="argument">
	<h2 id={arg.id.toString()} class="argument-title">
		<a on:click={copyToClipboard} href={'#' + arg.id}>{arg.title}</a>
	</h2>
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

<style lang="scss">
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
</style>
