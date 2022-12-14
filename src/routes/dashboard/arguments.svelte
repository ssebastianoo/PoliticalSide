<script lang="ts" context="module">
	import { buildArguments, getParties, deleteArgument } from '../../supabase';

	export async function load() {
		const allArguments = await buildArguments();
		const parties = await getParties();
		return { props: { allArguments, parties } };
	}
</script>

<script lang="ts">
	import {
		supabase,
		setPartyPosition,
		removePartyPosition,
		createArgument,
		updateArgument
	} from '../../supabase';
	import type { Argument, Arguments, Party } from '../../supabase';
	export let allArguments: Arguments, parties: Party[];

	const moveParty = async (e: Event, argumentID: string, view: string) => {
		const target = e.target as HTMLSelectElement;

		let agrees: boolean | null;
		if (view === 'agrees') agrees = true;
		else if (view === 'disagrees') agrees = false;
		else agrees = null;

		const partyInitial = target.value;

		await setPartyPosition(partyInitial, argumentID, agrees);
		for (const _view of Object.keys(allArguments[argumentID].parties)) {
			// @ts-ignore
			allArguments[argumentID].parties[_view] = allArguments[argumentID].parties[_view].filter(
				(party: Party) => party.initial !== partyInitial
			);
		}

		const { data: parties, error } = await supabase
			.from('party')
			.select('*')
			.eq('initial', partyInitial);

		// @ts-ignore
		if (parties) allArguments[argumentID].parties[view].push(parties[0]);

		allArguments = allArguments;
	};

	const createNewArgument = async (e: SubmitEvent) => {
		const target = e.target as HTMLFormElement;
		try {
			const newArgument = await createArgument(
				target._id.value,
				target._title.value,
				target.description.value
			);
			(e.target as HTMLFormElement).reset();
			allArguments[newArgument.id] = newArgument;
		} catch (err: any) {
			if (err.code === 'alreadyExists') {
				return alert('Argument already exists');
			} else {
				return alert('Something went wrong');
			}
		}
		alert('Argument created');
	};

	const updateArgumentData = async (argumentID: string, e: Event) => {
		const target = e.target as HTMLFormElement;
		try {
			await updateArgument(
				argumentID,
				target._id.value,
				target._title.value,
				target.description.value
			);
		} catch (err: any) {
			if (err.code === 'alreadyExists') {
				return alert('Argument already exists');
			} else {
				return alert('Something went wrong');
			}
		}
		alert('Argument updated');
	};

	const handleRemoveParty = async (party: Party, arg: Argument, view: string) => {
		await removePartyPosition(party.initial, arg.id);

		const v = view as 'agrees' | 'disagrees' | 'neutral';

		allArguments[arg.id].parties[v] = allArguments[arg.id].parties[v].filter((x: Party) => x.initial !== party.initial);
	};
</script>

<div class="create-argument">
	<h3>create argument</h3>
	<form on:submit|preventDefault={createNewArgument}>
		<input type="text" placeholder="id" name="_id" required />
		<input type="text" placeholder="name" name="_title" required />
		<input type="text" placeholder="description" name="description" required />
		<button type="submit">create</button>
	</form>
</div>
<hr />

{#each Object.entries(allArguments) as [id, arg]}
	<form
		on:submit|preventDefault={async (e) => {
			await updateArgumentData(arg.id, e);
		}}
	>
		<input type="text" name="_id" placeholder="id" value={arg.id} />
		<br />
		<input type="text" name="_title" placeholder="title" value={arg.title} />
		<br />
		<textarea type="text" name="description" placeholder="description" value={arg.description} />
		<br />
		<button type="submit">save</button>
	</form>
	<br />
	<button
		on:click={async () => {
			await deleteArgument(id);
			delete allArguments[id];
			allArguments = allArguments;
		}}>delete</button
	>
	<h3>d'accordo</h3>
	{#each Object.entries(arg.parties) as [view, viewParties]}
		<h3>{view}</h3>
		<div class="view">
			<select
				on:change={async (e) => {
					await moveParty(e, arg.id, view);
				}}
			>
				<option>add a party</option>
				{#each parties as party}
					{#if !viewParties.map((x) => x.initial).includes(party.initial)}
						<option value={party.initial}>{party.name}</option>
					{/if}
				{/each}
			</select>
			<br />
			<div class="parties">
				{#each viewParties as party}
					<div class="party">
						<img src={party.logo} alt="party logo" width="40" />
						<button
							on:click={async () => {
								await handleRemoveParty(party, arg, view);
							}}>remove</button
						>
					</div>
				{/each}
			</div>
		</div>
	{/each}
	<hr />
{/each}

<style lang="scss">
	.view {
		img {
			border-radius: 50%;
		}
	}

	.parties {
		display: flex;
		gap: 10px;

		.party {
			display: flex;
			flex-direction: column;
		}
	}
</style>
