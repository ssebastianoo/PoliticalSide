<script lang="ts" context="module">
	import { getArguments, getParties } from '../supabase';

	export async function load() {
		const allArguments = await getArguments();
		const parties = await getParties();
		return { props: { allArguments, parties } };
	}
</script>

<script lang="ts">
	import { setPartyPosition, removePartyPosition } from '../supabase';
	import type { Arguments, Party } from '../supabase';
	export let allArguments: Arguments, parties: Party[];

	const moveParty = async (e: Event, argumentID: string, view: string) => {
		const target = e.target as HTMLSelectElement;

		let agrees: boolean | null;
		if (view === 'agrees') agrees = true;
		else if (view === 'disagrees') agrees = false;
		else agrees = null;

		const partyInitial = target.value;

		await setPartyPosition(partyInitial, argumentID, agrees);
	};
</script>

<div class="dashboard">
	{#each Object.entries(allArguments) as [id, arg]}
		<input type="text" name="title" placeholder="title" value={arg.title} />
		<br />
		<textarea type="text" name="description" placeholder="description" value={arg.description} />
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
									await removePartyPosition(party.initial, id);
								}}>remove</button
							>
						</div>
					{/each}
				</div>
			</div>
		{/each}
		<hr />
	{/each}
</div>

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
