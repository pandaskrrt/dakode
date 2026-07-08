import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Biarkan fungsi load kosong agar SvelteKit bersedia merender tampilan HTML + animasi Anda terlebih dahulu
export const load: PageServerLoad = async () => {
    return {};
};

export const actions: Actions = {
    execute: async ({ cookies, locals }) => {
        // Hapus cookie dan sesuaikan session Anda di sini setelah animasi selesai
        cookies.delete('authToken', { path: '/' });
        locals.session = null;

        // Redirect ke halaman yang Anda inginkan setelah logout (misal ke halaman utama '/' atau '/login')
        throw redirect(303, '/');
    }
};