import { SECRET_JWT_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    const authToken = event.cookies.get('authToken');

    if (!authToken) {
        throw redirect(303, '/login');
    }

    try {
        const decoded = jwt.verify(authToken, SECRET_JWT_TOKEN) as { id: number };

        // Ambil semua order milik developer aktif
        const allOrders = await db.trackingOrder.findMany({
            where: { developerId: decoded.id },
            orderBy: { createdAt: 'desc' }
        });

        // Ambil data project milik developer aktif
        const projects = await db.project.findMany({
            where: { developerId: decoded.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const totalOrders = allOrders.length;
        const totalProjects = projects.length;

        // Hitung distribusi status order
        const statusCounts = {
            PENDING: 0,
            ON_PROGRESS: 0,
            REVIEW: 0,
            REVISION: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };

        let totalProgressSum = 0;
        let activeOrdersCount = 0;

        allOrders.forEach(order => {
            if (order.status in statusCounts) {
                statusCounts[order.status as keyof typeof statusCounts]++;
            }
            totalProgressSum += order.progress;
            if (order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
                activeOrdersCount++;
            }
        });

        const averageProgress = totalOrders > 0 ? Math.round(totalProgressSum / totalOrders) : 0;
        const completionRate = totalOrders > 0 ? Math.round((statusCounts.COMPLETED / totalOrders) * 100) : 0;

        const recentOrders = allOrders.slice(0, 5);

        // Generate GitHub-style activity data for 30 days
        const activityData = generateActivityData(allOrders);

        return {
            totalOrders,
            totalProjects,
            totalActiveOrders: activeOrdersCount,
            statusCounts,
            averageProgress,
            completionRate,
            recentOrders,
            activityData,
            projects: projects.map(p => ({
                ...p,
                imageCount: Math.floor(Math.random() * 8) + 1
            }))
        };

    } catch (err) {
        console.error(err);
        event.cookies.delete('authToken', { path: '/' });
        throw redirect(303, '/login');
    }
};

function generateActivityData(orders: any[]) {
    const today = new Date();
    const data: { [key: string]: number } = {};
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        data[key] = 0;
    }

    // Count orders per day
    orders.forEach(order => {
        const date = new Date(order.createdAt);
        const key = date.toISOString().split('T')[0];
        if (data[key] !== undefined) {
            data[key]++;
        }
    });

    // Convert to array format for chart
    return Object.entries(data).map(([date, count]) => ({
        date,
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
    }));
}