<script lang="ts">
	import type { Writable } from 'svelte/store';
	export let text: string, storeElement: Writable<boolean>, duration: number;
	let showPopup: boolean = false;

	storeElement.subscribe((v: boolean) => {
		showPopup = v;
		if (v) {
			setTimeout(() => {
				storeElement.set(false);
			}, duration);
		}
	});
</script>

<div class={"popup " + (showPopup ? "show-popup" : "hide-popup")}>
    <h2>{text}</h2>
</div>

<style lang="scss">
    @keyframes show-popup {
        0% {
            opacity: 0;
            transform: translate(-50%, 100vh);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    @keyframes hide-popup {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, 100vh);
        }
    }

    .popup {
        position: fixed;
        top: 50%;
		left: 50%;
        transform: translate(-50%, -50%);

        h2 {
            margin: 0;
            background-color: RGBA(0, 0, 0, 0.5);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 5px 5px 5px black;
        }
    }

    .show-popup {
        animation: show-popup .5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
    }

    .hide-popup {
        animation: hide-popup .5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
    }
</style>