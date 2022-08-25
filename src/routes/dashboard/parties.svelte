<script lang="ts" context="module">
	import { getParties } from '../../supabase';
	export async function load() {
		const parties = await getParties();
		return { props: { parties } };
	}
</script>

<script lang="ts">
	import type { Party } from '../../supabase';
	import { createParty, updateParty, deleteParty } from '../../supabase';

	export let parties: Party[];

	const handlePartyCreationForm = async (e: Event) => {
		const target = e.target as HTMLFormElement;
		try {
			const party = await createParty(
				target.initial.value,
				target._name.value,
				target.orientation.value,
				target.logo.files[0]
			);
			parties.push(party);
			parties.sort((a, b) => a.name.localeCompare(b.name));
			parties = parties;
		} catch (error: any) {
			alert(error.message);
		}
	};

	const handlePartyForm = async (partyInitial: string, e: Event) => {
		const target = e.target as HTMLFormElement;
		try {
			await updateParty(
				partyInitial,
				target.initial.value,
				target._name.value,
				target.orientation.value,
				target.logo.files[0]
			);
			alert('saved successfully');
		} catch (error: any) {
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={handlePartyCreationForm}>
	<div class="create-party">
		<input type="file" name="logo" accept="image/*" />
		<input type="text" name="initial" placeholder="initial" />
		<input type="text" name="_name" placeholder="name" />
		<input type="text" name="orientation" placeholder="orientation" />
		<button type="submit">create</button>
	</div>
</form>

<hr />

<div class="parties">
	{#each parties as party}
		<div class="party">
			<img
				src={party.logo
					? party.logo
					: 'https://ppxaucmjbjpxkxlcbxtb.supabase.co/storage/v1/object/public/parties/Default'}
				alt="Party Logo"
				width="50"
				height="50"
			/>
			<form
				on:submit|preventDefault={async (e) => {
					await handlePartyForm(party.initial, e);
				}}
			>
				<div class="party-content">
					<input type="file" name="logo" accept="image/*" />
					<input type="text" name="_name" placeholder="name" value={party.name} />
					<input type="text" name="initial" placeholder="initial" value={party.initial} />
					<input
						type="text"
						name="orientation"
						placeholder="orientation"
						value={party.orientation}
					/>
					<button type="submit">save</button>
					<button
						on:click|preventDefault={async () => {
							await deleteParty(party.initial);
							parties = parties.filter((p) => p.initial !== party.initial);
							parties = parties;
						}}>delete</button
					>
				</div>
			</form>
		</div>
		<hr />
	{/each}
</div>

<style lang="scss">
	.create-party {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;

		input {
			all: unset;
			border-bottom: 1px solid white;
		}

		button {
			width: 100px;
		}
	}

	.parties {
		margin: 20px;

		hr {
			margin: 20px 0;
		}

		.party {
			display: flex;
			align-items: center;
			gap: 10px;

			.party-content {
				display: flex;
				flex-direction: column;
				gap: 5px;

				input {
					all: unset;
					border-bottom: 1px solid white;
				}

				button {
					all: unset;
					border: 1px solid $color2;
					text-align: center;
					border-radius: 5px;
					padding: 2px;
					cursor: pointer;
				}
			}

			img {
				border-radius: 50%;
			}
		}
	}
</style>
