<script lang="ts">
	interface ProjectImage { id: number; imageUrl: string }
	interface Project {
		id: number;
		name: string;
		description: string;
		link?: string | null;
		images: ProjectImage[];
		developerName?: string;
	}

	let { project, onOpenDetail }: { project: Project; onOpenDetail: (p: Project) => void } = $props();

	let imgIndex = $state(0);
	let images = $derived(project.images ?? []);

	function nextImg(e: MouseEvent) {
		e.stopPropagation();
		if (images.length === 0) return;
		imgIndex = (imgIndex + 1) % images.length;
	}
	function prevImg(e: MouseEvent) {
		e.stopPropagation();
		if (images.length === 0) return;
		imgIndex = (imgIndex - 1 + images.length) % images.length;
	}
	function goToImg(e: MouseEvent, i: number) {
		e.stopPropagation();
		imgIndex = i;
	}
</script>

<div
	class="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50"
	onclick={() => onOpenDetail(project)}
	onkeydown={(e) => { if (e.key === 'Enter') onOpenDetail(project); }}
	role="button"
	tabindex="0"
>
	<div class="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
		{#if images.length > 0}
			{#key imgIndex}
				<img
					src={images[imgIndex].imageUrl}
					alt={project.name}
					class="h-full w-full object-cover"
				/>
			{/key}

			{#if images.length > 1}
				<button
					type="button"
					onclick={prevImg}
					class="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/60 group-hover:opacity-100"
					aria-label="Gambar sebelumnya"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
				</button>
				<button
					type="button"
					onclick={nextImg}
					class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/60 group-hover:opacity-100"
					aria-label="Gambar berikutnya"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
				</button>

				<div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
					{#each images as _, i}
						<button
							type="button"
							onclick={(e) => goToImg(e, i)}
							class="h-1.5 rounded-full transition-all duration-300 {i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}"
							aria-label="Ke gambar {i + 1}"
						></button>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="project-placeholder flex h-full w-full items-center justify-center">
				<span class="text-4xl font-black tracking-tight text-white/90">{project.name?.charAt(0) || '?'}</span>
			</div>
		{/if}

		{#if project.link}
			<span class="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 backdrop-blur-sm dark:bg-zinc-950/70 dark:text-zinc-300">
				<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
				Live
			</span>
		{:else}
			<span class="absolute top-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 backdrop-blur-sm dark:bg-zinc-950/70 dark:text-zinc-400">Private</span>
		{/if}
	</div>

	<div class="flex flex-1 flex-col p-5">
		<h3 class="text-base font-bold text-zinc-950 dark:text-white">{project.name || 'Untitled'}</h3>
		<p class="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{project.description || 'No description'}</p>
		<div class="mt-3 flex items-center justify-between">
			{#if project.developerName}
				<p class="text-xs text-zinc-400 dark:text-zinc-500">By {project.developerName}</p>
			{:else}
				<span></span>
			{/if}
			<span class="-translate-x-1 text-xs font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-blue-400">Lihat detail →</span>
		</div>
	</div>
</div>

<style>
	.project-placeholder {
		background: linear-gradient(140deg, #3b5bfd 0%, #6d5bfd 60%, #8a5bfd 100%);
	}
</style>