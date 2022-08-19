<script>
	import { page } from '$app/stores';
</script>

<div class="error">
    <h1>{$page.status}</h1>
</div>

<style>
    .error {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 80px);
    }

    h1 {
        margin: 0;
    }
</style>
