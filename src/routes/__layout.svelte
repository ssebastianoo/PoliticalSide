<script>
	import '../app.scss';
</script>

<main><slot /></main>

<footer>
	<p>
		<code>made by <a href="https://sebastianogirotto.me" target="_blank">seb</a></code>
	</p>
	<p>|</p>
	<a href="https://github.com/ssebastianoo/PoliticalSide/" target="_blank"
		><i class="fa-brands fa-github" /></a
	>
</footer>

<style lang="scss">
	main {
		min-height: calc(100vh - $footerHeight);
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: center;
		height: $footerHeight;
		gap: 20px;

		p {
			margin: 0;
			font-size: 18px;
		}

		i {
			font-size: 25px;
		}

		a {
			color: unset;
		}
	}
</style>
