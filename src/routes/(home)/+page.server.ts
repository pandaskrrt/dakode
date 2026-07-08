import { db } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	console.log('🔵 [SERVER LOAD] dipanggil')

	const projects = await db.project.findMany({
		include: {
			images: {
				select: {
					id: true,
					imageUrl: true
				}
			},
			developer: {
				select: {
					name: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	})

	console.log('🔵 [SERVER LOAD] jumlah project dari DB:', projects.length)
	console.log('🔵 [SERVER LOAD] isi:', JSON.stringify(projects, null, 2))

	const formattedProjects = projects.map(project => ({
		id: project.id,
		name: project.name,
		description: project.description,
		link: project.link,
		images: project.images.map(img => ({
			id: img.id,
			imageUrl: img.imageUrl
		})),
		developerName: project.developer?.name || 'Unknown'
	}))

	return {
		projects: formattedProjects,
		developerName: 'Dakode'
	}
}