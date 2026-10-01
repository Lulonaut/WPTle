<script lang="ts">
	export let word: string;
	/** Optional label shown above the word, e.g. on the game over screen */
	export let label = "";
</script>

<div class="def">
	{#if label}
		<h4>{label}</h4>
	{/if}
	<h2>{word.toUpperCase()}</h2>
</div>

<style>
	h4 {
		text-transform: uppercase;
		margin-bottom: 0.4rem;
	}
	h2 {
		margin-bottom: 0.8rem;
	}
</style>
