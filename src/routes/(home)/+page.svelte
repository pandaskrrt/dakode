<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade, scale, fly } from 'svelte/transition';
	import ProjectCard from './ProjectCard.svelte';

	interface ProjectImage { id: number; imageUrl: string }
	interface Project {
		id: number;
		name: string;
		description: string;
		link?: string | null;
		images: ProjectImage[];
		developerName?: string;
	}

	let { data }: PageProps = $props();

	let projects = $derived(data?.projects ?? []);

	const jargonList = ['produk digital.', 'kode yang scalable.', 'pengalaman mulus.', 'hasil nyata.'];
	let currentIndex = $state(0);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % jargonList.length;
		}, 2800);

		return () => clearInterval(interval);
	});

	let showTrackingModal = $state(false);
	let trackingCode = $state('');
	let isTracking = $state(false);
	let trackingResult = $state<any>(null);
	let trackingError = $state('');

	function openTrackingModal() {
		showTrackingModal = true;
		trackingCode = '';
		trackingResult = null;
		trackingError = '';
	}

	function closeTrackingModal() {
		showTrackingModal = false;
		trackingCode = '';
		trackingResult = null;
		trackingError = '';
	}

	async function handleTrackOrder(event: Event) {
		event.preventDefault();
		if (!trackingCode.trim()) {
			trackingError = 'Masukkan kode order terlebih dahulu';
			return;
		}

		isTracking = true;
		trackingError = '';
		trackingResult = null;

		try {
			const response = await fetch(`/api/track/${encodeURIComponent(trackingCode.trim())}`);
			const result = await response.json();

			if (response.ok) {
				trackingResult = result;
			} else {
				trackingError = result.error || 'Order tidak ditemukan';
			}
		} catch (error) {
			trackingError = 'Gagal melacak order. Silakan coba lagi.';
		} finally {
			isTracking = false;
		}
	}

	let selectedProject = $state<Project | null>(null);
	let detailImgIndex = $state(0);

	function openProjectDetail(project: Project) {
		selectedProject = project;
		detailImgIndex = 0;
	}
	function closeProjectDetail() {
		selectedProject = null;
	}
	function detailNextImg() {
		if (!selectedProject) return;
		const len = selectedProject.images.length;
		if (len === 0) return;
		detailImgIndex = (detailImgIndex + 1) % len;
	}
	function detailPrevImg() {
		if (!selectedProject) return;
		const len = selectedProject.images.length;
		if (len === 0) return;
		detailImgIndex = (detailImgIndex - 1 + len) % len;
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (selectedProject) closeProjectDetail();
			else if (showTrackingModal) closeTrackingModal();
		}
		if (selectedProject && selectedProject.images.length > 1) {
			if (event.key === 'ArrowRight') detailNextImg();
			if (event.key === 'ArrowLeft') detailPrevImg();
		}
	}

	function blurFade(node: Element, { duration = 600, delay = 0, yOffset = 10, center = false } = {}) {
		return {
			duration,
			delay,
			easing: cubicOut,
			css: (t: number) => {
				const opacity = t;
				const blur = (1 - t) * 4;
				const y = (1 - t) * yOffset;
				return `
					opacity: ${opacity};
					filter: blur(${blur}px);
					transform: ${center ? 'translateX(-50%) ' : ''}translateY(${y}px);
				`;
			}
		};
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<main class="font-apple relative w-full overflow-x-hidden bg-white dark:bg-zinc-950 transition-colors duration-500 select-none">

	<div class="pointer-events-none fixed inset-0 z-0 grid-squares-bg"></div>
	<div class="pointer-events-none fixed -top-40 -left-40 z-0 h-[36rem] w-[36rem] rounded-full bg-blue-500/[0.06] blur-[120px] dark:bg-blue-500/[0.08]"></div>

	<section class="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-8 sm:px-12 md:px-16">
		<div class="mx-auto w-full max-w-6xl flex flex-col items-center text-center">

			{#if mounted}
				<div class="w-fit inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm mb-8 tracking-widest uppercase dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
					<span class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
					Full-Stack Developer · Open for Freelance
				</div>

				<h1 class="heading-font text-zinc-950 dark:text-white relative w-full flex flex-col items-center gap-1 sm:gap-2">
					<span class="block text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1]">
						Saya ubah ide jadi
					</span>

					<span class="rotator-line relative block text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
						{#key currentIndex}
							<span
								class="rotator-word absolute text-blue-600 dark:text-blue-400 left-1/2"
								in:blurFade={{ duration: 650, delay: 200, yOffset: 10, center: true }}
								out:blurFade={{ duration: 300, yOffset: -6, center: true }}
							>
								{jargonList[currentIndex]}
							</span>
						{/key}
					</span>
				</h1>

				<p class="reveal-line mt-8 max-w-lg text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed" style="animation-delay:.15s">
					Bangun aplikasi web dari nol sampai deploy — cepat, rapi, dan gampang dikembangin ke depannya.
				</p>

				<div class="reveal-line mt-8 flex flex-wrap items-center justify-center gap-3" style="animation-delay:.25s">
					<a href="#projects"
						class="flex h-12 items-center rounded-full bg-zinc-950 px-7 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-lg active:scale-[0.98]"
					>Lihat Project</a>
					<a href="mailto:hello@dakode.dev"
						class="flex h-12 items-center rounded-full border-2 border-zinc-950 bg-transparent px-7 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-950 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black active:scale-[0.98]"
					>Hubungi Saya</a>
				</div>

				<div class="reveal-line mt-10 w-full max-w-md" style="animation-delay:.35s">
					<div class="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/70 p-1.5 pl-5 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-zinc-400 dark:text-zinc-500">
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
						</svg>
						<input
							type="text"
							placeholder="Kode order, mis. ORD-1234"
							class="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-white dark:placeholder-zinc-600"
							readonly
							onclick={openTrackingModal}
						/>
						<button
							type="button"
							onclick={openTrackingModal}
							class="flex h-9 shrink-0 items-center rounded-full bg-zinc-950 px-5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
						>Lacak</button>
					</div>
					<p class="mt-2 px-2 text-xs text-zinc-400 dark:text-zinc-500">Klien bisa cek status & progress project pakai kode order di atas.</p>
				</div>
			{/if}
		</div>
	</section>

	<section id="projects" class="relative z-10 w-full px-8 sm:px-12 md:px-16 pb-28 pt-6 scroll-mt-20">
		<div class="mx-auto w-full max-w-6xl">
			<div class="mb-10 flex flex-col gap-2">
				<span class="w-fit inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm tracking-widest uppercase dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
					<span class="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
					Portfolio
				</span>
				<h2 class="heading-font text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">Proyek yang Pernah Saya Kerjain</h2>
				<p class="max-w-xl text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Sebagian dari project client & personal yang udah rilis atau lagi jalan.</p>
			</div>

			{#if !projects || projects.length === 0}
				<div class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-300 py-24 text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<path d="M9 9h6v6H9z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-zinc-500">Belum ada project yang dipublikasikan.</p>
					<p class="text-xs text-zinc-400">Tambahkan project di dashboard admin.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each projects as project, i (project.id)}
						<div in:fly={{ y: 20, duration: 500, delay: i * 80 }}>
							<ProjectCard {project} onOpenDetail={openProjectDetail} />
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>

{#if showTrackingModal}
	<div
		class="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/40 backdrop-blur-md p-4"
		onmousedown={closeTrackingModal}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="font-apple w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-900"
			onmousedown={(e) => e.stopPropagation()}
			transition:scale={{ duration: 250, start: 0.94, opacity: 0, easing: cubicOut }}
		>
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-lg font-bold text-zinc-950 dark:text-white">Lacak Order</h2>
				<button type="button" onclick={closeTrackingModal} class="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>

			{#if trackingError}
				<div class="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs text-red-600 dark:text-red-400" transition:fade={{ duration: 150 }}>
					{trackingError}
				</div>
			{/if}

			{#if trackingResult}
				<div class="mb-4 space-y-3" use:blurFade={{ duration: 450 }}>
					<div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
						<span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Kode Order</span>
						<span class="text-sm font-bold text-zinc-950 dark:text-white">{trackingResult.code}</span>
					</div>
					<div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
						<span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</span>
						<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
							{trackingResult.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
							{trackingResult.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
							{trackingResult.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
						">
							<span class="h-1.5 w-1.5 rounded-full
								{trackingResult.status === 'COMPLETED' ? 'bg-emerald-500' : ''}
								{trackingResult.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : ''}
								{trackingResult.status === 'PENDING' ? 'bg-yellow-500' : ''}
							"></span>
							{trackingResult.status}
						</span>
					</div>
					<div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
						<span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Project</span>
						<span class="text-sm font-medium text-zinc-950 dark:text-white">{trackingResult.projectName}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tanggal Update</span>
						<span class="text-sm text-zinc-700 dark:text-zinc-300">{new Date(trackingResult.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
					</div>
				</div>

				<button
					type="button"
					onclick={() => {
						trackingResult = null;
						trackingCode = '';
					}}
					class="mt-2 h-11 w-full rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
				>
					Cari Lagi
				</button>
			{:else}
				<form onsubmit={handleTrackOrder} class="space-y-4">
					<div class="space-y-1.5">
						<label for="track-code" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
							Masukkan Kode Order
						</label>
						<input
							id="track-code"
							type="text"
							bind:value={trackingCode}
							placeholder="Contoh: ORD-1234"
							class="modal-input"
							required
							autofocus
						/>
						<p class="text-xs text-zinc-400 dark:text-zinc-500">Masukkan kode order yang diberikan oleh client/project manager.</p>
					</div>

					<button
						type="submit"
						disabled={isTracking}
						class="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-100"
					>
						{#if isTracking}
							<span class="flex items-center gap-2">
								<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								Sedang mencari...
							</span>
						{:else}
							Lacak Order
						{/if}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}

{#if selectedProject}
	<div
		class="fixed inset-0 z-[200] flex items-center justify-center bg-gray-950/50 backdrop-blur-md p-4"
		onmousedown={closeProjectDetail}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="font-apple relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-900 max-h-[88vh] flex flex-col"
			onmousedown={(e) => e.stopPropagation()}
			transition:scale={{ duration: 250, start: 0.94, opacity: 0, easing: cubicOut }}
		>
			<button
				type="button"
				onclick={closeProjectDetail}
				class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
				aria-label="Tutup"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>

			<div class="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				{#if selectedProject.images.length > 0}
					{#key detailImgIndex}
						<img
							src={selectedProject.images[detailImgIndex].imageUrl}
							alt={selectedProject.name}
							class="h-full w-full object-cover"
							transition:fade={{ duration: 200 }}
						/>
					{/key}

					{#if selectedProject.images.length > 1}
						<button
							type="button"
							onclick={detailPrevImg}
							class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
							aria-label="Gambar sebelumnya"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<button
							type="button"
							onclick={detailNextImg}
							class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
							aria-label="Gambar berikutnya"
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>

						<div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
							{#each selectedProject.images as _, i}
								<button
									type="button"
									onclick={() => detailImgIndex = i}
									class="h-1.5 rounded-full transition-all duration-300 {i === detailImgIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}"
									aria-label="Ke gambar {i + 1}"
								></button>
							{/each}
						</div>

						<span class="absolute bottom-3 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
							{detailImgIndex + 1} / {selectedProject.images.length}
						</span>
					{/if}
				{:else}
					<div class="project-placeholder-detail flex h-full w-full items-center justify-center">
						<span class="text-6xl font-black tracking-tight text-white/90">{selectedProject.name?.charAt(0) || '?'}</span>
					</div>
				{/if}
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h2 class="text-xl font-bold text-zinc-950 dark:text-white">{selectedProject.name}</h2>
						{#if selectedProject.developerName}
							<p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">By {selectedProject.developerName}</p>
						{/if}
					</div>
					{#if selectedProject.link}
						<span class="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Live</span>
					{:else}
						<span class="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Private</span>
					{/if}
				</div>

				<p class="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
					{selectedProject.description || 'Belum ada deskripsi.'}
				</p>

				{#if selectedProject.link}
					<a
						href={selectedProject.link}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
					>
						<span>Kunjungi Project</span>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
							<line x1="7" y1="17" x2="17" y2="7" />
							<polyline points="7 7 17 7 17 17" />
						</svg>
					</a>
				{:else}
					<div class="mt-6 flex h-11 w-full items-center justify-center rounded-full border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
						Project ini bersifat private
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.font-apple, .heading-font {
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
			'Helvetica Neue', Helvetica, Arial, sans-serif;
	}
	.heading-font { letter-spacing: -0.02em; }

	.grid-squares-bg {
		background-image:
			linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px);
		background-size: 44px 44px;
		animation: gridDrift 26s linear infinite;
	}
	:global(.dark) .grid-squares-bg {
		background-image:
			linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
	}
	@keyframes gridDrift {
		from { background-position: 0 0; }
		to   { background-position: 44px 44px; }
	}

	.project-placeholder-detail {
		background: linear-gradient(140deg, #3b5bfd 0%, #6d5bfd 60%, #8a5bfd 100%);
	}

	.rotator-line {
		height: 1.2em;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.rotator-word {
		white-space: nowrap;
		position: absolute;
		display: inline-block;
		left: 50%;
		transform: translateX(-50%);
		transform-origin: center;
	}

	.reveal-line {
		opacity: 0;
		animation: revealLine 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	@keyframes revealLine {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	:global(.modal-input) {
		width: 100%;
		height: 2.75rem;
		border-radius: 0.9rem;
		border: 1px solid rgb(228 228 231);
		background: rgba(255, 255, 255, 0.6);
		padding: 0 1rem;
		font-size: 0.875rem;
		color: rgb(24 24 27);
		outline: none;
		transition: all 0.15s ease;
	}
	:global(.dark .modal-input) {
		border-color: rgb(63 63 70);
		background: rgba(24, 24, 27, 0.6);
		color: rgb(250 250 250);
	}
	:global(.modal-input:focus) {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	:global(.dark .modal-input:focus) {
		border-color: #60a5fa;
		box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
	}

	@media (prefers-reduced-motion: reduce) {
		.grid-squares-bg { animation: none; }
		.reveal-line { animation: none; opacity: 1; }
		.rotator-word { transition: none; }
	}
</style>