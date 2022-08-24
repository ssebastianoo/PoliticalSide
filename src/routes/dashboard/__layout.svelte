<script lang="ts">
	import { supabase } from '../../supabase';
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
	<button
		on:click={async () => {
			await supabase.auth.signOut();
			user = null;
			authenticated = false;
		}}>signout</button
	>
	<div class="dashboard">
		<slot />
	</div>
{/if}
