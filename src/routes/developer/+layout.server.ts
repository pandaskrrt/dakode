import { SECRET_JWT_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const authToken = event.cookies.get('authToken');

    // Jika tidak ada token, arahkan ke login
    if (!authToken) {
        throw redirect(303, '/login');
    }

    try {
        // Verifikasi token untuk mengambil data developer aktif
        const decoded = jwt.verify(authToken, SECRET_JWT_TOKEN) as { id: number; email: string; name: string };
        
        // Ambil data agregasi jumlah status secara real-time dari database
        const rawStatusCounts = await db.trackingOrder.groupBy({
            by: ['status'],
            where: {
                developerId: decoded.id
            },
            _count: { _all: true }
        });

        // Struktur data default dengan semua status dari enum
        const statusCounts = {
            PENDING: 0,
            ON_PROGRESS: 0,
            REVIEW: 0,
            REVISION: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };

        // Memetakan hasil query ke variabel statusCounts
        rawStatusCounts.forEach(item => {
            if (item.status === 'PENDING') statusCounts.PENDING = item._count._all;
            else if (item.status === 'ON_PROGRESS') statusCounts.ON_PROGRESS = item._count._all;
            else if (item.status === 'REVIEW') statusCounts.REVIEW = item._count._all;
            else if (item.status === 'REVISION') statusCounts.REVISION = item._count._all;
            else if (item.status === 'COMPLETED') statusCounts.COMPLETED = item._count._all;
            else if (item.status === 'CANCELLED') statusCounts.CANCELLED = item._count._all;
        });

        // Ambil data developers untuk dropdown di modal order
        const developers = await db.developer.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        // Ambil data projects untuk dropdown atau keperluan lain
        const projects = await db.project.findMany({
            where: {
                developerId: decoded.id
            },
            select: {
                id: true,
                name: true,
                description: true,
                link: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Ambil data tracking orders terbaru
        const recentOrders = await db.trackingOrder.findMany({
            where: {
                developerId: decoded.id
            },
            include: {
                histories: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return {
            user: {
                name: decoded.name,
                email: decoded.email
            },
            statusCounts,
            developers,
            projects,
            recentOrders
        };

    } catch (err) {
        // Jika token tidak valid / kedaluwarsa, hapus cookie dan kembali ke login
        event.cookies.delete('authToken', { path: '/' });
        throw redirect(303, '/login');
    }
};