import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Ambil semua tracking orders
  const allOrders = await db.trackingOrder.findMany({
    include: {
      developer: {
        select: {
          name: true,
          email: true
        }
      },
      histories: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Hitung total orders
  const totalOrders = await db.trackingOrder.count();

  // Hitung orders berdasarkan status
  const statusCounts = await db.trackingOrder.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  return {
    orders: allOrders,
    totalOrders,
    statusCounts
  };
};

export const actions: Actions = {
  createOrder: async ({ request }) => {
    const formData = await request.formData();
    
    const orderCode = formData.get('orderCode') as string;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const projectName = formData.get('projectName') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string || 'PENDING';
    const progress = parseInt(formData.get('progress') as string) || 0;
    const developerId = parseInt(formData.get('developerId') as string);

    // Validasi
    if (!orderCode || !customerName || !customerEmail || !projectName || !developerId) {
      return fail(400, {
        error: 'All required fields must be filled'
      });
    }

    try {
      // Cek apakah orderCode sudah ada
      const existingOrder = await db.trackingOrder.findUnique({
        where: { orderCode }
      });

      if (existingOrder) {
        return fail(400, {
          error: 'Order code already exists'
        });
      }

      // Create order
      const order = await db.trackingOrder.create({
        data: {
          orderCode,
          customerName,
          customerEmail,
          projectName,
          description: description || null,
          status: status as any,
          progress,
          developerId,
          histories: {
            create: {
              status: status as any,
              progress,
              note: `Order created with status: ${status}`
            }
          }
        }
      });

      return {
        success: true,
        order
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return fail(500, {
        error: 'Failed to create order'
      });
    }
  }
};