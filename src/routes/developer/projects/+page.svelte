<script lang="ts">
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: PageProps = $props();

	interface DeveloperInfo { id: number; name: string; email: string }
	interface ProjectImageItem { id: number; imageUrl: string }
	interface ProjectItem {
		id: number;
		name: string;
		description: string;
		link: string | null;
		developerId: number;
		createdAt: string | Date;
		updatedAt: string | Date;
		developer: DeveloperInfo;
		images: ProjectImageItem[];
	}

	const projects = $derived(data.projects as ProjectItem[]);
	const developers = $derived(data.developers as DeveloperInfo[] ?? []);

	// ==== Carousel state ====
	let imageIndexMap = $state<Record<number, number>>({});

	function goToImage(projectId: number, index: number) {
		imageIndexMap = { ...imageIndexMap, [projectId]: index };
	}

	function nextImage(projectId: number, total: number) {
		const current = imageIndexMap[projectId] ?? 0;
		imageIndexMap = { ...imageIndexMap, [projectId]: (current + 1) % total };
	}

	function prevImage(projectId: number, total: number) {
		const current = imageIndexMap[projectId] ?? 0;
		imageIndexMap = { ...imageIndexMap, [projectId]: (current - 1 + total) % total };
	}

	// ==== Modal states ====
	let showCreateModal = $state(false);
	let isCreating = $state(false);
	let editingProject = $state<ProjectItem | null>(null);
	let isUpdating = $state(false);
	let deletingProject = $state<ProjectItem | null>(null);
	let isDeleting = $state(false);

	// ==== Create form state ====
	let createImages = $state<File[]>([]);
	let createImagePreviews = $state<string[]>([]);

	// ==== Edit form state ====
	let keptImageIds = $state<number[]>([]);
	let newImages = $state<File[]>([]);
	let newImagePreviewUrls = $state<string[]>([]);

	// ==== Functions for create ====
	function handleCreateImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const files = Array.from(input.files);
			const remainingSlots = 5 - createImages.length;
			const newFiles = files.slice(0, remainingSlots);
			
			createImages = [...createImages, ...newFiles];
			
			const newPreviews = newFiles.map(f => URL.createObjectURL(f));
			createImagePreviews = [...createImagePreviews, ...newPreviews];
		}
		input.value = '';
	}

	function removeCreateImage(index: number) {
		URL.revokeObjectURL(createImagePreviews[index]);
		createImages = createImages.filter((_, i) => i !== index);
		createImagePreviews = createImagePreviews.filter((_, i) => i !== index);
	}

	// ==== Functions for edit ====
	$effect(() => {
		if (editingProject) {
			keptImageIds = editingProject.images.map((img) => img.id);
			newImages = [];
			newImagePreviewUrls = [];
		}
	});

	$effect(() => {
		const urls = newImages.map((f) => URL.createObjectURL(f));
		newImagePreviewUrls = urls;
		return () => {
			urls.forEach((u) => URL.revokeObjectURL(u));
		};
	});

	function totalImageCount() {
		return keptImageIds.length + newImages.length;
	}

	function removeExistingImage(imageId: number) {
		keptImageIds = keptImageIds.filter((id) => id !== imageId);
	}

	function handleNewImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const incoming = Array.from(input.files);
			const remainingSlots = 5 - keptImageIds.length;
			const newFiles = incoming.slice(0, Math.max(remainingSlots, 0));
			newImages = [...newImages, ...newFiles];
		}
		input.value = '';
	}

	function removeNewImage(index: number) {
		newImages = newImages.filter((_, i) => i !== index);
	}

	function formatDate(value: string | Date) {
		return new Date(value).toLocaleDateString('id-ID', { 
			day: 'numeric', 
			month: 'short', 
			year: 'numeric' 
		});
	}

	function closeAllModals() {
		showCreateModal = false;
		editingProject = null;
		deletingProject = null;
		// Reset create form
		createImages = [];
		createImagePreviews = [];
	}

	// Reset create form when modal closes
	$effect(() => {
		if (!showCreateModal) {
			createImages = [];
			createImagePreviews = [];
		}
	});
</script>

<main class="font-apple relative min-h-screen w-full bg-white px-6 py-10 sm:px-10 lg:px-16">
	<div class="mx-auto w-full max-w-[1600px]">
		<!-- Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-zinc-950">Projects</h1>
				<p class="text-sm text-zinc-500">Manage your project portfolio</p>
			</div>
			<button 
				type="button" 
				onclick={() => showCreateModal = true}
				class="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				New Project
			</button>
		</div>

		{#if projects.length === 0}
			<div class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-300 py-24 text-center">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="18" height="18" rx="2"/>
						<path d="M9 9h6v6H9z"/>
					</svg>
				</div>
				<p class="text-sm font-medium text-zinc-500">No projects yet.</p>
				<p class="text-xs text-zinc-400">Click "New Project" to create one</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each projects as project (project.id)}
					{@const activeIndex = imageIndexMap[project.id] ?? 0}
					{@const hasMultiple = project.images.length > 1}
					<div class="group relative flex flex-col overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/60">

						<div class="relative aspect-[4/3] w-full overflow-hidden">
							{#if project.images.length > 0}
								<div class="carousel-track" style="transform: translateX(-{activeIndex * 100}%);">
									{#each project.images as img}
										<img src={img.imageUrl} alt={project.name} class="carousel-slide" />
									{/each}
								</div>

								{#if hasMultiple}
									<button
										type="button"
										class="carousel-nav carousel-nav-prev"
										onclick={(e) => { e.stopPropagation(); prevImage(project.id, project.images.length); }}
										aria-label="Previous image"
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
											<path d="m15 18-6-6 6-6"/>
										</svg>
									</button>
									<button
										type="button"
										class="carousel-nav carousel-nav-next"
										onclick={(e) => { e.stopPropagation(); nextImage(project.id, project.images.length); }}
										aria-label="Next image"
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
											<path d="m9 18 6-6-6-6"/>
										</svg>
									</button>

									<div class="carousel-dots">
										{#each project.images as _, i}
											<button
												type="button"
												class="carousel-dot"
												class:carousel-dot-active={i === activeIndex}
												onclick={(e) => { e.stopPropagation(); goToImage(project.id, i); }}
												aria-label="Go to image {i + 1}"
											></button>
										{/each}
									</div>
								{/if}
							{:else}
								<div class="flex h-full w-full items-center justify-center project-placeholder">
									<span class="text-3xl font-black tracking-tight text-white/90">{project.name.charAt(0)}</span>
								</div>
							{/if}

							<!-- Quick actions -->
							<div class="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								<button
									type="button"
									onclick={() => editingProject = project}
									title="Edit project"
									class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
								>
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
									</svg>
								</button>
								<button
									type="button"
									onclick={() => deletingProject = project}
									title="Delete project"
									class="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition hover:bg-red-50"
								>
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 6h18"/>
										<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
										<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
									</svg>
								</button>
							</div>

							{#if project.link}
								<a href={project.link} target="_blank" rel="noopener noreferrer"
									title="Open project link"
									class="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
								>
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
										<line x1="7" y1="17" x2="17" y2="7"/>
										<polyline points="7 7 17 7 17 17"/>
									</svg>
								</a>
							{/if}
						</div>

						<div class="flex flex-1 flex-col p-5">
							<h3 class="text-[15px] font-bold tracking-tight text-zinc-950">{project.name}</h3>
							<p class="mt-1.5 text-sm leading-relaxed text-zinc-500 line-clamp-2">{project.description}</p>

							<div class="mt-4 flex items-center gap-2 text-[11px] font-medium text-zinc-400">
								<span class="truncate">{project.developer?.name ?? '—'}</span>
								<span class="h-1 w-1 shrink-0 rounded-full bg-zinc-300"></span>
								<span class="shrink-0">{formatDate(project.createdAt)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<!-- Modal: Create Project -->
{#if showCreateModal}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/30 backdrop-blur-md p-4" onmousedown={closeAllModals}>
		<div class="font-apple w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onmousedown={(e) => e.stopPropagation()}>
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-lg font-bold text-zinc-950">Create New Project</h2>
				<button type="button" onclick={closeAllModals} class="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
					</svg>
				</button>
			</div>

			{#if form?.action === 'create' && form?.error}
				<p class="mb-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{form.error}</p>
			{/if}

			<form
				method="POST"
				action="?/createProject"
				enctype="multipart/form-data"
				use:enhance={() => {
					isCreating = true;
					return async ({ result, update }) => {
						isCreating = false;
						if (result.type === 'success') {
							closeAllModals();
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-1.5">
					<label for="create-name" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Project Name</label>
					<input id="create-name" name="name" required class="modal-input" />
				</div>

				<div class="space-y-1.5">
					<label for="create-description" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Description</label>
					<textarea id="create-description" name="description" required rows="3" class="modal-input resize-none"></textarea>
				</div>

				<div class="space-y-1.5">
					<label for="create-link" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Link (optional)</label>
					<input id="create-link" name="link" type="url" class="modal-input" />
				</div>

				<div class="space-y-1.5">
					<label for="create-developer" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Developer</label>
					<select id="create-developer" name="developerId" required class="modal-input">
						{#each developers as dev}
							<option value={dev.id}>{dev.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<label class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
						Project Images ({createImages.length}/5)
					</label>
					
					<input
						type="file"
						name="images"
						accept=".png,.jpg,.jpeg,.gif"
						multiple
						class="modal-input file-input"
						disabled={createImages.length >= 5}
						onchange={handleCreateImageChange}
					/>
					<span class="helper-text">Upload up to 5 images</span>

					{#if createImagePreviews.length > 0}
						<div class="image-manage-grid">
							{#each createImagePreviews as url, i}
								<div class="image-manage-item image-manage-item-new">
									<img src={url} alt="Preview {i + 1}" />
									<button type="button" class="remove-preview-btn" onclick={() => removeCreateImage(i)}>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
											<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
										</svg>
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<button type="submit" disabled={isCreating}
					class="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
				>
					{isCreating ? 'Saving...' : 'Create Project'}
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Edit Project -->
{#if editingProject}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/30 backdrop-blur-md p-4" onmousedown={closeAllModals}>
		<div class="font-apple w-full max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onmousedown={(e) => e.stopPropagation()}>
			<div class="mb-5 flex items-center justify-between">
				<h2 class="text-lg font-bold text-zinc-950">Edit Project</h2>
				<button type="button" onclick={closeAllModals} class="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
					</svg>
				</button>
			</div>

			{#if form?.action === 'update' && form?.error}
				<p class="mb-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{form.error}</p>
			{/if}

			<form
				method="POST"
				action="?/updateProject"
				enctype="multipart/form-data"
				use:enhance={({ formData }) => {
					isUpdating = true;

					// Manual control of images
					formData.delete('newImages');
					formData.delete('keptImageIds');
					for (const id of keptImageIds) {
						formData.append('keptImageIds', id.toString());
					}
					for (const file of newImages) {
						formData.append('newImages', file);
					}

					return async ({ result, update }) => {
						isUpdating = false;
						if (result.type === 'success') closeAllModals();
						await update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editingProject.id} />

				<div class="space-y-1.5">
					<label for="edit-name" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Project Name</label>
					<input id="edit-name" name="name" required class="modal-input" value={editingProject.name} />
				</div>

				<div class="space-y-1.5">
					<label for="edit-description" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Description</label>
					<textarea id="edit-description" name="description" required rows="3" class="modal-input resize-none">{editingProject.description}</textarea>
				</div>

				<div class="space-y-1.5">
					<label for="edit-link" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Link (optional)</label>
					<input id="edit-link" name="link" type="url" class="modal-input" value={editingProject.link ?? ''} />
				</div>

				<div class="space-y-1.5">
					<label for="edit-developer" class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Developer</label>
					<select id="edit-developer" name="developerId" required class="modal-input">
						{#each developers as dev}
							<option value={dev.id} selected={dev.id === editingProject.developerId}>{dev.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<label class="block px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
						Project Images ({totalImageCount()}/5)
					</label>

					{#if editingProject.images.length > 0}
						<div class="image-manage-grid">
							{#each editingProject.images as img}
								{#if keptImageIds.includes(img.id)}
									<div class="image-manage-item">
										<img src={img.imageUrl} alt="Existing" />
										<button type="button" class="remove-preview-btn" onclick={() => removeExistingImage(img.id)}>
											<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
												<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
											</svg>
										</button>
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					<input
						type="file"
						name="newImagesInput"
						accept=".png,.jpg,.jpeg,.gif"
						multiple
						class="modal-input file-input mt-2"
						disabled={totalImageCount() >= 5}
						onchange={handleNewImageChange}
					/>
					<span class="helper-text">Maximum 5 images total. Remove old images to add new ones.</span>

					{#if newImagePreviewUrls.length > 0}
						<div class="image-manage-grid">
							{#each newImagePreviewUrls as url, i}
								<div class="image-manage-item image-manage-item-new">
									<img src={url} alt="Preview new {i + 1}" />
									<button type="button" class="remove-preview-btn" onclick={() => removeNewImage(i)}>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
											<path d="M18 6 6 18"/><path d="m6 6 12 12"/>
										</svg>
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<button type="submit" disabled={isUpdating}
					class="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
				>
					{isUpdating ? 'Saving...' : 'Save Changes'}
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Modal: Delete Confirmation -->
{#if deletingProject}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/30 backdrop-blur-md p-4" onmousedown={closeAllModals}>
		<div class="font-apple w-full max-w-sm rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xl" onmousedown={(e) => e.stopPropagation()}>
			<div class="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
				</svg>
			</div>
			<h2 class="mt-3 text-lg font-bold text-zinc-950">Delete "{deletingProject.name}"?</h2>
			<p class="mt-1 text-sm text-zinc-500">This action cannot be undone. The project and all its images will be permanently deleted.</p>

			{#if form?.action === 'delete' && form?.error}
				<p class="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{form.error}</p>
			{/if}

			<div class="mt-5 flex items-center gap-2">
				<button type="button" onclick={closeAllModals}
					class="h-11 flex-1 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
				>Cancel</button>

				<form
					method="POST"
					action="?/deleteProject"
					class="flex-1"
					use:enhance={() => {
						isDeleting = true;
						return async ({ result, update }) => {
							isDeleting = false;
							if (result.type === 'success') closeAllModals();
							await update();
						};
					}}
				>
					<input type="hidden" name="id" value={deletingProject.id} />
					<button type="submit" disabled={isDeleting}
						class="h-11 w-full rounded-full bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
					>
						{isDeleting ? 'Deleting...' : 'Yes, Delete'}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	.font-apple {
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
			'Helvetica Neue', Helvetica, Arial, sans-serif;
	}

	.project-placeholder {
		background: linear-gradient(140deg, #3b5bfd 0%, #6d5bfd 60%, #8a5bfd 100%);
	}

	.carousel-track {
		display: flex;
		height: 100%;
		width: 100%;
		transition: transform 0.35s ease;
	}

	.carousel-slide {
		flex: 0 0 100%;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.carousel-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 28px;
		height: 28px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.85);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		opacity: 0;
		transition: opacity 0.2s ease, background 0.2s ease;
		color: rgb(24 24 27);
	}
	.group:hover .carousel-nav {
		opacity: 1;
	}
	.carousel-nav:hover {
		background: #ffffff;
	}
	.carousel-nav-prev { left: 8px; }
	.carousel-nav-next { right: 8px; }

	.carousel-dots {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 5px;
		z-index: 10;
	}

	.carousel-dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.55);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.carousel-dot-active {
		background: #ffffff;
		width: 16px;
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
	:global(.modal-input:focus) {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	:global(textarea.modal-input) {
		height: auto;
		padding-top: 0.6rem;
		padding-bottom: 0.6rem;
	}
	:global(select.modal-input) {
		cursor: pointer;
	}
	:global(.file-input[disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.image-manage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
		gap: 8px;
		margin-top: 8px;
	}

	.image-manage-item {
		position: relative;
		aspect-ratio: 1 / 1;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid rgb(228 228 231);
	}
	.image-manage-item-new {
		border-color: #3b82f6;
	}

	.image-manage-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.remove-preview-btn {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 18px;
		height: 18px;
		border-radius: 9999px;
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0;
	}
	.remove-preview-btn:hover {
		background: #e74c3c;
	}

	.helper-text {
		display: block;
		margin-top: 4px;
		font-size: 0.7rem;
		color: rgb(139 143 167);
	}
</style>