<script lang="ts" context="module">
	import { buildArguments, getParties, deleteArgument } from '../../supabase';

	export async function load() {
		const allArguments = await buildArguments();
		const parties = await getParties();
		return { props: { allArguments, parties } };
	}
</script>

<script lang="ts">
	import { supabase, setPartyPosition, removePartyPosition, createArgument } from '../../supabase';
	import type { Argument, Arguments, Party } from '../../supabase';
	export let allArguments: Arguments, parties: Party[];
	import { onMount } from 'svelte';
	let loaded: boolean = false;
	let authenticated: boolean = false;
	let user = supabase.auth.user();

	const checkIfAuthenticated = async () => {
		if (user) {
			const { data, error } = await supabase.from('admin').select('*').eq('email', user.email);
			if (data!.length > 0) {
				authenticated = true;
			} else {
				authenticated = false;
			}
		} else {
			authenticated = false;
		}
	};

	onMount(async () => {
		await checkIfAuthenticated();
		loaded = true;
	});

	const logIn = async (e: SubmitEvent) => {
		const target = e.target as HTMLFormElement;

		const { user: _user, error } = await supabase.auth.signIn({
			email: target.email.value,
			password: target.password.value
		});
		if (error) return alert(error.message);
		user = _user;
		await checkIfAuthenticated();
	};

	const moveParty = async (e: Event, argumentID: string, view: string) => {
		const target = e.target as HTMLSelectElement;

		let agrees: boolean | null;
		if (view === 'agrees') agrees = true;
		else if (view === 'disagrees') agrees = false;
		else agrees = null;

		const partyInitial = target.value;

		await setPartyPosition(partyInitial, argumentID, agrees);
	};

	const handleForm = async (e: SubmitEvent) => {
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
	};
</script>

{#if !loaded}
	<p>loading</p>
{:else if !authenticated}
	<div class="login">
		<form on:submit|preventDefault={logIn}>
			<input type="email" name="email" placeholder="email" />
			<input type="password" name="password" placeholder="password" />
			<button type="submit">login</button>
		</form>
	</div>
{:else}
<button on:click={async () => {await supabase.auth.signOut();user=null;authenticated=false;}}>signout</button>
	<div class="dashboard">
		<div class="create-argument">
			<h3>create argument</h3>
			<form on:submit|preventDefault={handleForm}>
				<input type="text" placeholder="id" name="_id" required />
				<input type="text" placeholder="name" name="_title" required />
				<input type="text" placeholder="description" name="description" required />
				<button type="submit">create</button>
			</form>
		</div>
		<hr />

		{#each Object.entries(allArguments) as [id, arg]}
			<input type="text" name="_id" placeholder="id" value={arg.id} />
			<br />
			<input type="text" name="_title" placeholder="title" value={arg.title} />
			<br />
			<textarea type="text" name="description" placeholder="description" value={arg.description} />
			<br />
			<button
				on:click={async () => {
					await deleteArgument(id);
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
{/if}

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
