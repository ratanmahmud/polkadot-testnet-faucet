<script lang="ts">
	import { PUBLIC_CAPTCHA_KEY } from "$env/static/public";
	import { testnetName } from "$lib/utils/stores";
	import { fly } from "svelte/transition";
	import { request as faucetRequest } from "../utils";
	import CaptchaV2 from "./CaptchaV2.svelte";
	import Cross from "./icons/Cross.svelte";
	import Tick from "./icons/Tick.svelte";

	let address: string = "";
	export let network: number;
	let useParachain: boolean;
	$: useParachain = network > 0;
	let token: string = "";
	let formValid: boolean;
	$: formValid = !!address && !!token && (!useParachain || !!network);

	let webRequest: Promise<string>;

	function onSubmit() {
		webRequest = request(address);
	}

	function onToken(tokenEvent: CustomEvent<string>) {
		token = tokenEvent.detail;
	}

	async function request(address: string): Promise<string> {
		return faucetRequest(address, token, network);
	}
</script>

<form on:submit|preventDefault={onSubmit} class="w-full">
	<div class="inputs-container">
		<label class="label" for="address">
			<span class="label-text">Your {$testnetName} Address</span>
		</label>
		<input
			type="text"
			bind:value={address}
			placeholder="Enter your address"
			class="input w-full input-primary text-sm"
			id="address"
			disabled={!!webRequest}
			data-testid="address"
		/>
	</div>
	<div class="inputs-container md:grid md:grid-cols-3 md:gap-4 ">
		<div class="form-control">
			<label class="label cursor-pointer">
				<span class="label-text">Use parachain</span>
				<input
					type="checkbox"
					data-testid="parachain-check"
					bind:checked={useParachain}
					class="checkbox checkbox-primary"
				/>
			</label>
		</div>
		<div class="form-control w-full max-w-xs col-span-2">
			<input
				disabled={!useParachain}
				bind:value={network}
				type="number"
				placeholder={useParachain ? "Parachain id" : "Using Relay chain"}
				min="1000"
				max="9999"
				pattern="\d*"
				class="input input-bordered input-primary w-full max-w-xs"
				data-testid="parachain"
			/>
		</div>
	</div>
	{#if !webRequest}
		<div class="grid place-items-center">
			<CaptchaV2 captchaKey={PUBLIC_CAPTCHA_KEY ?? ""} on:token={onToken} />
		</div>
		<button
			class="btn btn-primary mt-6"
			type="submit"
			data-testid="submit-button"
			disabled={!formValid}
		>
			Submit</button
		>
	{:else}
		{#await webRequest}
			<button class="btn btn-primary loading" disabled> Loading</button>
		{:then result}
			<div in:fly={{ y: 30, duration: 500 }} class="alert alert-success shadow-lg">
				<div>
					<Tick />
					<span class="text-left">
						Your funds have been sent.<br />
						<a
							href={`https://rococo.subscan.io/extrinsic/${result}`}
							target="_blank"
							rel="noreferrer"
							class="link link-neutral"
						>
							Click here to see the transaction
						</a>
					</span>
				</div>
			</div>
		{:catch error}
			<div class="alert alert-error shadow-lg" data-testid="error">
				<div>
					<Cross />
					<span class="text-left">{error}</span>
				</div>
			</div>
		{/await}
	{/if}
</form>

<style>
	.inputs-container {
		margin-bottom: 1.5rem;
	}
</style>
