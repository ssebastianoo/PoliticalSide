<script lang="ts" context="module">
	import { getArguments } from '../supabase';

	export async function load() {
		const allArguments = await getArguments();
		return { props: { allArguments } };
	}
</script>

<script lang="ts">
	import type { Arguments } from '../supabase';
	import { copiedPopup } from '../store';
	import ArgumentBox from '$lib/ArgumentBox.svelte';
	import Popup from '$lib/Popup.svelte';

	export let allArguments: Arguments;
	let results: Arguments = allArguments;

	const handleSearch = (e: KeyboardEvent) => {
		const target = e.target as HTMLInputElement;

		if (target.value.trim() === '') {
			results = allArguments;
		} else {
			results = {};
			for (const arg in allArguments) {
				if (
					allArguments[arg].title
						.toLowerCase()
						.replace(' ', '')
						.trim()
						.includes(target.value.toLowerCase().replace(' ', '').trim())
				) {
					results[arg] = allArguments[arg];
				}
			}
		}
	};
</script>

<Popup text="Link copiato" storeElement={copiedPopup} duration={1000} />
<div class="arguments">
	<h1>Political Side</h1>
	<input type="text" placeholder="Cerca..." class="search" on:keyup={handleSearch} />
	{#each Object.entries(results) as [id, arg]}
		<ArgumentBox {arg} />
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
	}
</style>
