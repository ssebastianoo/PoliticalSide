<script lang="ts">
	import { hidePopup } from '../store';
	import type { Party } from '../supabase';
	export let party: Party;
</script>

<div class="party-popup">
	<div class="sections">
		<div class="left">
			<img src={party.logo} width="100" height="100" alt={party.name + "'s logo"} />
		</div>
		<div class="right">
			<div class="top">
				<h2>{party.name}</h2>
				<button
					on:click={() => {
						hidePopup.set(true);
					}}>❌</button
				>
			</div>
			<p>{party.initial}</p>
			<p>{party.orientation}</p>
		</div>
	</div>
</div>

<style lang="scss">
	.party-popup {
		background-color: RGBA(0, 0, 0, 0.8);
		padding: 10px;
		border-radius: 8px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		position: absolute;

		.sections {
			display: flex;
			gap: 20px;

            .top {
                display: flex;
                gap: 4px
            }
		}

		img {
			border-radius: 50%;
		}

		h2 {
			margin: 0;
		}

		p {
			margin-bottom: 0;
		}

		button {
			all: unset;
            cursor: pointer;
		}
	}
</style>
