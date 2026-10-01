<script lang="ts">
	import { fade } from "svelte/transition";
	import Header from "./Header.svelte";
	import { Board } from "./board";
	import Keyboard from "./keyboard";
	import Modal from "./Modal.svelte";
	import { getContext, onMount, setContext } from "svelte";
	import Settings from "./settings";
	import {
		Share,
		Separator,
		Definition,
		Statistics,
		Distribution,
		Timer,
		Toaster,
		ShareGame,
		Historical,
	} from "./widgets";
	import {
		contractNum,
		DELAY_INCREMENT,
		PRAISE,
		modeData,
		ROWS,
		COLS,
		newSeed,
		GameState,
		seededRandomInt,
		LetterStates,
		words,
		Stats,
	} from "../utils";
	import { letterStates, settings, mode } from "../stores";

	export let word: string;
	export let stats: Stats;
	export let game: GameState;
	export let toaster: Toaster;

	setContext("toaster", toaster);
	const version = getContext<string>("version");
	const AIRAC = getContext<string>("AIRAC");

	// implement transition delay on keys
	const delay = DELAY_INCREMENT * ROWS + 800;

	let showSettings = false;
	let showStats = false;
	let showHistorical = false;
	let showRefresh = false;

	let board: Board;
	let timer: Timer;

	function submitWord() {
		if (game.latestWord.length !== COLS) {
			toaster.pop("Not enough letters");
			board.shake(game.guesses);
		} else if (words.contains(game.latestWord)) {
			if (game.guesses > 0) {
				const hm = game.checkHardMode();
				if ($settings.hard[$mode]) {
					if (hm.type === "🟩") {
						toaster.pop(
							`${contractNum(hm.pos + 1)} letter must be ${hm.char.toUpperCase()}`
						);
						board.shake(game.guesses);
						return;
					} else if (hm.type === "🟨") {
						toaster.pop(`Guess must contain ${hm.char.toUpperCase()}`);
						board.shake(game.guesses);
						return;
					}
				} else if (hm.type !== "⬛") {
					game.validHard = false;
				}
			}
			game.board.state[game.guesses] = game.guess(word);
			++game.guesses;
			$letterStates.update(game.lastState, game.lastWord);
			$letterStates = $letterStates;
			if (game.lastWord === word) win();
			else if (game.guesses === ROWS) lose();
		} else {
			toaster.pop("Not in word list");
			board.shake(game.guesses);
		}
	}

	function win() {
		board.bounce(game.guesses - 1);
		game.active = false;
		setTimeout(
			() => toaster.pop(PRAISE[game.guesses - 1]),
			DELAY_INCREMENT * COLS + DELAY_INCREMENT
		);
		setTimeout(setShowStatsTrue, delay * 1.4);
		if (!modeData.modes[$mode].historical) {
			stats.addWin(game.guesses, modeData.modes[$mode]);
			stats = stats;
			localStorage.setItem(`stats-${$mode}`, stats.toString());
		}
	}

	function lose() {
		game.active = false;
		setTimeout(setShowStatsTrue, delay);
		if (!modeData.modes[$mode].historical) {
			stats.addLoss(modeData.modes[$mode]);
			stats = stats;
			localStorage.setItem(`stats-${$mode}`, stats.toString());
		}
	}

	function concede() {
		showSettings = false;
		setTimeout(setShowStatsTrue, DELAY_INCREMENT);
		lose();
	}

	function reload() {
		modeData.modes[$mode].historical = false;
		modeData.modes[$mode].seed = newSeed($mode);
		game = new GameState($mode, localStorage.getItem(`state-${$mode}`) ?? undefined);
		word = words.words[seededRandomInt(0, words.words.length, modeData.modes[$mode].seed)];
		$letterStates = new LetterStates();
		showStats = false;
		showRefresh = false;
		timer.reset($mode);
	}

	function setShowStatsTrue() {
		if (!game.active) showStats = true;
	}

	function onSwipe(e: Swipe) {
		switch (e.detail.direction) {
			case "left":
				$mode = ($mode + 1) % modeData.modes.length;
				toaster.pop(modeData.modes[$mode].name);
				break;
			case "right":
				$mode = ($mode - 1 + modeData.modes.length) % modeData.modes.length;
				toaster.pop(modeData.modes[$mode].name);
				break;
		}
	}

	onMount(() => {
		if (!game.active) setTimeout(setShowStatsTrue, delay);
	});
	// $: toaster.pop(word);
</script>

<svelte:body on:click={board.hideCtx} on:contextmenu={board.hideCtx} />

<main class:guesses={game.guesses !== 0} style="--rows: {ROWS}; --cols: {COLS}">
	<Header
		bind:showRefresh
		showStats={stats.played > 0 || (modeData.modes[$mode].historical && !game.active)}
		on:stats={() => (showStats = true)}
		on:settings={() => (showSettings = true)}
		on:reload={reload}
	/>
	<div class="modes">
		{#each modeData.modes as m, i}
			<button class:active={$mode === i} on:click={() => ($mode = i)}>{m.name}</button>
		{/each}
	</div>
	<Board
		bind:this={board}
		bind:value={game.board.words}
		board={game.board}
		guesses={game.guesses}
		icon={modeData.modes[$mode].icon}
		on:swipe={onSwipe}
	/>
	<div class="keyboard-wrap">
		<Keyboard
			on:keystroke={() => board.hideCtx()}
			bind:value={game.board.words[game.guesses === ROWS ? 0 : game.guesses]}
			on:submitWord={submitWord}
			on:esc={() => {
				showStats = false;
				showSettings = false;
			}}
			disabled={!game.active || showHistorical}
		/>
	</div>
</main>

<Modal bind:visible={showStats}>
	{#if !game.active}
		<div class="answer">
			<Definition {word} label="Today's word was" />
		</div>
	{/if}
	{#if modeData.modes[$mode].historical}
		<h2 class="historical">Statistics not available for historical games</h2>
	{:else}
		<Statistics data={stats} />
		<Distribution distribution={stats.guesses} {game} />
	{/if}
	<Separator visible={!game.active}>
		<Timer
			slot="1"
			bind:this={timer}
			on:timeup={() => (showRefresh = true)}
			on:reload={reload}
		/>
		<Share slot="2" state={game} />
	</Separator>
	<ShareGame wordNumber={game.wordNumber} />
	{#if game.active}
		<!-- Fade with delay is to prevent a bright red button from appearing as soon as refresh is pressed -->
		<div
			in:fade={{ delay: 300 }}
			class="button concede"
			on:click={concede}
			on:keydown={concede}
		>
			give up
		</div>
	{/if}
</Modal>

<Modal fullscreen={true} bind:visible={showSettings}>
	<Settings state={game} on:historical={() => (showHistorical = true)} />
	{#if game.active}
		<div class="button concede" on:click={concede} on:keydown={concede}>give up</div>
	{/if}

	<svelte:fragment slot="footer">
		<a href="https://www.nytimes.com/games/wordle/" target="_blank" rel="noreferrer"
			>Original Wordle</a
		>
		<div>
			<div>v{version}</div>
			<div>Based on AIRAC {AIRAC}</div>
			<div
				title="double click to reset your stats"
				class="word"
				on:dblclick={() => {
					localStorage.clear();
					toaster.pop("localStorage cleared");
				}}
			>
				{modeData.modes[$mode].name} word #{game.wordNumber}
			</div>
		</div>
	</svelte:fragment>
</Modal>

<Modal bind:visible={showHistorical}>
	<Historical bind:showSettings />
</Modal>

<style lang="scss">
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		max-width: var(--game-width);
		margin: auto;
		position: relative;
	}
	.keyboard-wrap {
		width: 100%;
		margin-top: auto;
	}
	.modes {
		display: flex;
		gap: 6px;
		margin: 16px 0;
	}
	.modes button {
		font: inherit;
		font-size: var(--fs-small);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.05rem;
		color: var(--fg-secondary);
		background: transparent;
		border: 1px solid var(--border-primary);
		border-radius: 999px;
		padding: 7px 18px;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
	}
	.modes button:hover:not(.active) {
		color: var(--fg-primary);
	}
	.modes button.active {
		color: var(--evaluated-key-color);
		background: var(--color-correct);
		border-color: var(--color-correct);
	}
	.historical {
		text-align: center;
		margin-top: 10px;
		padding: 0 20px;
		text-transform: uppercase;
	}
	.answer {
		text-align: center;
		color: var(--color-correct);
	}
	.concede {
		background-color: var(--red);
	}
</style>
