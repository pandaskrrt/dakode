import { db } from '$lib/server/db'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const allProjects = await db.project.findMany({
		include: {
			developer: {
				select: {
					id: true,
					name: true,
					email: true
				}
			},
			images: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	const totalProjects = await db.project.count()

	// Ambil semua developer untuk dropdown
	const developers = await db.developer.findMany({
		select: {
			id: true,
			name: true,
			email: true
		}
	})

	return {
		projects: allProjects,
		totalProjects,
		developers
	}
}

export const actions: Actions = {
	createProject: async ({ request }) => {
		const formData = await request.formData()

		const name = formData.get('name') as string
		const description = formData.get('description') as string
		const link = formData.get('link') as string
		const developerId = parseInt(formData.get('developerId') as string)
		const images = formData.getAll('images') as File[]

		// Validasi
		if (!name || !description || !developerId) {
			return fail(400, {
				action: 'create',
				error: 'Name, description, and developer are required'
			})
		}

		try {
			const project = await db.project.create({
				data: {
					name,
					description,
					link: link || null,
					developerId
				}
			})

			// Handle images
			if (images && images.length > 0) {
				const validImages = images.filter(file => file.size > 0)
				if (validImages.length > 0) {
					const { writeProjectImages } = await import('$lib/helper/write-file')
					const imageUrls = await writeProjectImages(validImages)

					if (imageUrls.length > 0) {
						await db.projectImage.createMany({
							data: imageUrls.map((url) => ({
								imageUrl: url,
								projectId: project.id
							}))
						})
					}
				}
			}

			return {
				action: 'create',
				success: true,
				project
			}
		} catch (error) {
			console.error('Error creating project:', error)
			return fail(500, {
				action: 'create',
				error: 'Failed to create project'
			})
		}
	},

	updateProject: async ({ request }) => {
		const formData = await request.formData()

		const id = parseInt(formData.get('id') as string)
		const name = formData.get('name') as string
		const description = formData.get('description') as string
		const link = formData.get('link') as string
		const developerId = parseInt(formData.get('developerId') as string)
		const keptImageIds = formData.getAll('keptImageIds').map(id => parseInt(id as string))
		const newImages = formData.getAll('newImages') as File[]

		// Validasi
		if (!id || !name || !description || !developerId) {
			return fail(400, {
				action: 'update',
				error: 'All fields are required'
			})
		}

		try {
			// Get current images
			const currentImages = await db.projectImage.findMany({
				where: { projectId: id }
			})

			// Delete removed images
			const imagesToDelete = currentImages.filter(img => !keptImageIds.includes(img.id))
			for (const img of imagesToDelete) {
				const { deleteProjectImage } = await import('$lib/helper/write-file')
				await deleteProjectImage(img.imageUrl)
				await db.projectImage.delete({ where: { id: img.id } })
			}

			// Update project
			const project = await db.project.update({
				where: { id },
				data: {
					name,
					description,
					link: link || null,
					developerId
				}
			})

			// Add new images
			if (newImages && newImages.length > 0) {
				const validImages = newImages.filter(file => file.size > 0)
				if (validImages.length > 0) {
					const { writeProjectImages } = await import('$lib/helper/write-file')
					const imageUrls = await writeProjectImages(validImages)

					if (imageUrls.length > 0) {
						await db.projectImage.createMany({
							data: imageUrls.map((url) => ({
								imageUrl: url,
								projectId: project.id
							}))
						})
					}
				}
			}

			return {
				action: 'update',
				success: true,
				project
			}
		} catch (error) {
			console.error('Error updating project:', error)
			return fail(500, {
				action: 'update',
				error: 'Failed to update project'
			})
		}
	},

	deleteProject: async ({ request }) => {
		const formData = await request.formData()
		const id = parseInt(formData.get('id') as string)

		if (!id) {
			return fail(400, {
				action: 'delete',
				error: 'Project id is required'
			})
		}

		try {
			// Get images first to delete files
			const images = await db.projectImage.findMany({
				where: { projectId: id }
			})

			// Delete image files
			const { deleteProjectImage } = await import('$lib/helper/write-file')
			for (const img of images) {
				await deleteProjectImage(img.imageUrl)
			}

			// Delete project (cascade will delete images from DB)
			await db.project.delete({ where: { id } })

			return {
				action: 'delete',
				success: true,
				id
			}
		} catch (error) {
			console.error('Error deleting project:', error)
			return fail(500, {
				action: 'delete',
				error: 'Failed to delete project'
			})
		}
	}
}