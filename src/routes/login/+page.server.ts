import { SECRET_JWT_TOKEN } from '$env/static/private';
import LoginSchema from '$lib/schemas/login';
import { db } from '$lib/server/db';
import { verify } from '@node-rs/argon2';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return { form: await superValidate(zod(LoginSchema)) };
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(LoginSchema));

        if (!form.valid) {
            return fail(400, {
                form,
                message: ''
            });
        }

        const { username, password } = form.data;
        const callback = event.url.searchParams.get('callback');

        const developer = await db.developer.findUnique({
            where: { email: username },
            select: {
                id: true,
                email: true,
                password: true,
                name: true
            }
        });

        if (!developer) {
            return fail(400, {
                form,
                message: 'Email atau password salah!'
            });
        }

        const isPasswordRight = await verify(developer.password, password);

        if (!isPasswordRight) {
            return fail(400, {
                form,
                message: 'Email atau password salah!'
            });
        }

        const authToken = jwt.sign(
            {
                id: developer.id,
                email: developer.email,
                name: developer.name,
                role: 'DEVELOPER'
            },
            SECRET_JWT_TOKEN,
            { expiresIn: '24h' }
        );

        event.cookies.set('authToken', authToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24
        });

        if (callback) {
            throw redirect(303, callback);
        }

        throw redirect(303, '/developer');
    }
};