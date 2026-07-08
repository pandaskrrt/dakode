<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    let { data, form } = $props<{
        data: PageData;
        form: any;
    }>();

    let isLoading = $state(false);
    let mounted = $state(false);

    onMount(() => {
        mounted = true;
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<main class="heading-font relative h-screen w-full overflow-hidden bg-zinc-50 transition-colors duration-500 dark:bg-zinc-950 flex flex-col items-center justify-center select-none px-4">

    <div class="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block z-0">
        <div class="stars-field absolute inset-0">
            <div class="stars-layer-far"></div>
            <div class="stars-layer-mid"></div>
            <div class="stars-layer-near"></div>
        </div>
    </div>
    <div class="pointer-events-none absolute inset-0 block overflow-hidden dark:hidden z-0">
        <div class="absolute inset-0 dot-grid-light"></div>
    </div>

    <div class="relative z-10 w-full max-w-[420px] mt-24">
        {#if mounted}

            <div class="peek-window absolute -top-[143px] left-1/2 -translate-x-1/2 w-48 h-36 overflow-hidden z-0 pointer-events-none flex items-end justify-center">
                <div class="absolute bottom-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-xl animate-pulse"></div>

                <div class="peeking-emoji relative w-36 h-36 bg-white/90 dark:bg-zinc-900/90 border-2 border-zinc-200/80 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden">
                    <svg class="w-32 h-32 relative top-1" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">

                        <circle cx="32" cy="30" r="21" class="fill-amber-400 dark:fill-amber-500 stroke-amber-500/20 dark:stroke-amber-600/30" stroke-width="1"/>

                        <!-- Alis pose Shh: terangkat, kesan "ssh, serius nih" -->
                        <g class="brows-shh">
                            <path d="M19 24C20.5 22 23.5 21.5 25.5 23" class="stroke-amber-800 dark:stroke-amber-900" stroke-width="2" stroke-linecap="round" fill="none"/>
                            <path d="M45 24C43.5 22 40.5 21.5 38.5 23" class="stroke-amber-800 dark:stroke-amber-900" stroke-width="2" stroke-linecap="round" fill="none"/>
                        </g>

                        <g class="eyes-tired">
                            <path d="M21 29C22.5 27.5 24.5 27.5 26 29" class="stroke-zinc-950" stroke-width="2.5" stroke-linecap="round"/>
                            <path d="M38 29C39.5 27.5 41.5 27.5 43 29" class="stroke-zinc-950" stroke-width="2.5" stroke-linecap="round"/>
                        </g>

                        <!-- Mata pose Shh: bentuk almond, melirik fokus, bukan bulat polos -->
                        <g class="eyes-shh">
                            <path d="M21 28.5C22.2 27 25.8 27 27 28.5C25.8 30 22.2 30 21 28.5Z" class="fill-zinc-950 animate-blink"/>
                            <path d="M37 28.5C38.2 27 41.8 27 43 28.5C41.8 30 38.2 30 37 28.5Z" class="fill-zinc-950 animate-blink"/>
                        </g>

                        <circle cx="17" cy="34" r="2" class="fill-rose-500/25 dark:fill-rose-600/30"/>
                        <circle cx="47" cy="34" r="2" class="fill-rose-500/25 dark:fill-rose-600/30"/>

                        <path d="M29 38C30.5 36.5 33.5 36.5 35 38" class="stroke-amber-800 mouth-tired" stroke-width="2" stroke-linecap="round" fill="none"/>

                        <!-- Mulut pose Shh: monyong kecil (pucker), bukan garis lurus -->
                        <g class="mouth-shh">
                            <ellipse cx="32" cy="36.5" rx="2.6" ry="2.2" class="fill-amber-700 dark:fill-amber-800"/>
                            <ellipse cx="32" cy="36" rx="2.6" ry="1.4" class="fill-amber-600/70 dark:fill-amber-700/70"/>
                        </g>

                        <g class="hand-shh-action">
                            <path d="M32 54V43" class="stroke-amber-500 dark:stroke-amber-600" stroke-width="6" stroke-linecap="round"/>
                            <path d="M32 43V34" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="3.5" stroke-linecap="round"/>
                            <circle cx="32" cy="45" r="4.5" class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                        </g>
                    </svg>
                </div>
            </div>

            <svg class="grip-hand grip-hand-left" viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="9" rx="13" ry="9.5" class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M7 9 C6 16, 7 23, 9.5 27 C11 29.3, 14 29.3, 15 27 C16 24, 15.5 17, 15 11"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M15.3 8.5 C14.3 16, 15 24.5, 17.5 29 C19 31.5, 22 31.5, 23 29 C24.5 25, 24 17, 23.3 10"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M23.6 9.5 C22.8 16.5, 23.3 23.5, 25.5 27.3 C27 29.6, 30 29.6, 31 27.3 C32 24, 31.5 17, 31 11"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M9.5 18 Q11.5 19.5 14.5 18" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
                <path d="M17.5 18.5 Q20 20 22.5 18.5" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
                <path d="M25.5 18.5 Q28 20 30.3 18.5" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
            </svg>
            <svg class="grip-hand grip-hand-right" viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="20" cy="9" rx="13" ry="9.5" class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M7 9 C6 16, 7 23, 9.5 27 C11 29.3, 14 29.3, 15 27 C16 24, 15.5 17, 15 11"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M15.3 8.5 C14.3 16, 15 24.5, 17.5 29 C19 31.5, 22 31.5, 23 29 C24.5 25, 24 17, 23.3 10"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M23.6 9.5 C22.8 16.5, 23.3 23.5, 25.5 27.3 C27 29.6, 30 29.6, 31 27.3 C32 24, 31.5 17, 31 11"
                      class="fill-amber-400 dark:fill-amber-500 stroke-amber-500 dark:stroke-amber-600" stroke-width="1"/>
                <path d="M9.5 18 Q11.5 19.5 14.5 18" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
                <path d="M17.5 18.5 Q20 20 22.5 18.5" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
                <path d="M25.5 18.5 Q28 20 30.3 18.5" class="stroke-amber-600 dark:stroke-amber-700" stroke-width="1" stroke-linecap="round" fill="none"/>
            </svg>

            <div class="login-card w-full bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-xl shadow-zinc-200/50 dark:shadow-none transition-all duration-300 relative z-10">

                <div class="flex flex-col items-center text-center mb-8">
                    <h2 class="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                        Dashboard Akun
                    </h2>
                    <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Masuk untuk mengelola website Anda
                    </p>
                </div>

                {#if form?.message}
                    <div class="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-6 animate-shake">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <span>{form.message}</span>
                    </div>
                {/if}

                <form method="POST" class="space-y-5" onsubmit={() => isLoading = true}>
                    <div class="space-y-2">
                        <label for="username" class="text-xs font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-400 block px-1">
                            Alamat Email
                        </label>
                        <div class="relative flex items-center">
                            <span class="absolute left-4 text-zinc-400 dark:text-zinc-500">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                            </span>
                            <input
                                type="email"
                                id="username"
                                name="username"
                                placeholder="name@company.com"
                                required
                                class="w-full h-11 pl-11 pr-4 bg-white/50 dark:bg-zinc-950/40 border rounded-2xl text-sm font-medium outline-none transition-all duration-200 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="password" class="text-xs font-semibold tracking-wider uppercase text-zinc-600 dark:text-zinc-400 block px-1">
                            Kata Sandi
                        </label>
                        <div class="relative flex items-center">
                            <span class="absolute left-4 text-zinc-400 dark:text-zinc-500">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </span>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                class="w-full h-11 pl-11 pr-4 bg-white/50 dark:bg-zinc-950/40 border rounded-2xl text-sm font-medium outline-none transition-all duration-200 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        class="w-full h-11 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-2xl font-semibold text-sm transition-all duration-300 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center justify-center gap-2 mt-2"
                    >
                        {#if isLoading}
                            <svg class="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Memproses...</span>
                        {:else}
                            <span>Masuk ke Dashboard</span>
                        {/if}
                    </button>
                </form>

                <div class="text-center mt-8 text-[11px] font-medium tracking-wide text-zinc-400 dark:text-zinc-600 uppercase">
                    © 2026 dakode group
                </div>
            </div>
        {/if}
    </div>
</main>

<style>
    .heading-font {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* --- 📦 GARIS TIMELINE UTAMA ANIMASI PEEK-A-BOO (9 Detik) --- */
    .peeking-emoji {
        transform: translateY(100%);
        animation: emojiComplexTimeline 9s cubic-bezier(0.25, 1, 0.5, 1) infinite;
    }

    @keyframes emojiComplexTimeline {
        0%, 10%   { transform: translateY(100%); }
        24%       { transform: translateY(32%); }
        30%, 40%  { transform: translateY(18%); }
        50%, 76%  { transform: translateY(12%); }
        88%, 100% { transform: translateY(100%); }
    }

    /* --- 🎭 STRUKTUR KONTROL EKSPRESI --- */

    .eyes-tired { animation: activeTiredStage 9s linear infinite; }
    .eyes-shh { animation: activeNormalStage 9s linear infinite; }
    .brows-shh { animation: activeNormalStage 9s linear infinite; }

    @keyframes activeTiredStage {
        0%, 16%   { opacity: 0; }
        24%, 34%  { opacity: 1; }
        42%, 100% { opacity: 0; }
    }
    @keyframes activeNormalStage {
        0%, 34%   { opacity: 0; }
        44%, 78%  { opacity: 1; }
        86%, 100% { opacity: 0; }
    }

    .mouth-tired { animation: activeTiredStage 9s linear infinite; }
    .mouth-shh { animation: activeNormalStage 9s linear infinite; }

    /* --- 🖐️ TANGAN MENCENGKERAM TEPI ATAS CARD --- */
    .grip-hand {
        position: absolute;
        top: -10px;
        width: 30px;
        height: 26px;
        z-index: 20;
        opacity: 0;
        transform-origin: top center;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
    }
    .grip-hand-left {
        left: 30%;
        animation: gripLeftTimeline 9s ease-in-out infinite;
    }
    .grip-hand-right {
        right: 30%;
        transform: scaleX(-1);
        animation: gripRightTimeline 9s ease-in-out infinite;
    }

    @keyframes gripLeftTimeline {
        0%, 9%    { opacity: 0; transform: translateY(-22px) scale(0.9); }
        13%       { opacity: 1; transform: translateY(-4px) scale(1); }
        17%       { opacity: 1; transform: translateY(2px) scale(1); }
        21%       { opacity: 1; transform: translateY(-2px) scale(1); }
        25%       { opacity: 1; transform: translateY(2px) scale(1); }
        29%, 32%  { opacity: 1; transform: translateY(0px) scale(1); }
        38%       { opacity: 0; transform: translateY(-14px) scale(0.9); }
        100%      { opacity: 0; }
    }
    @keyframes gripRightTimeline {
        0%, 11%   { opacity: 0; transform: scaleX(-1) translateY(-22px) scale(0.9); }
        15%       { opacity: 1; transform: scaleX(-1) translateY(-4px) scale(1); }
        19%       { opacity: 1; transform: scaleX(-1) translateY(2px) scale(1); }
        23%       { opacity: 1; transform: scaleX(-1) translateY(-2px) scale(1); }
        27%       { opacity: 1; transform: scaleX(-1) translateY(2px) scale(1); }
        31%, 34%  { opacity: 1; transform: scaleX(-1) translateY(0px) scale(1); }
        40%       { opacity: 0; transform: scaleX(-1) translateY(-14px) scale(0.9); }
        100%      { opacity: 0; }
    }

    /* Lengan + Telunjuk Gerakan Shh */
    .hand-shh-action {
        transform: translateY(40px);
        opacity: 0;
        animation: handShhTimeline 9s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
    }
    @keyframes handShhTimeline {
        0%, 38%   { transform: translateY(40px); opacity: 0; }
        46%       { transform: translateY(0px); opacity: 1; }
        78%       { transform: translateY(0px); opacity: 1; }
        86%, 100% { transform: translateY(40px); opacity: 0; }
    }

    /* --- DETAIL KEDIPAN MATA --- */
    .animate-blink {
        animation: blink 3s linear infinite;
    }
    @keyframes blink {
        0%, 46%, 54%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.1); }
    }

    /* --- BACKGROUND DEKORATIF --- */
    .dot-grid-light {
        background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
        background-size: 26px 26px;
        mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 75%);
    }
    .stars-layer-far, .stars-layer-mid, .stars-layer-near {
        position: absolute;
        inset: -10%;
        background-repeat: repeat;
    }
    .stars-layer-far {
        background-image: radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4), transparent 60%);
        background-size: 550px 550px;
        animation: drift 140s linear infinite;
    }
    .stars-layer-mid {
        background-image: radial-gradient(1.4px 1.4px at 25% 25%, rgba(255,255,255,0.5), transparent 60%);
        background-size: 400px 400px;
        animation: drift 95s linear infinite;
    }
    .stars-layer-near {
        background-image: radial-gradient(1.8px 1.8px at 40% 20%, rgba(255,255,255,0.6), transparent 65%);
        background-size: 300px 300px;
        animation: drift 65s linear infinite;
    }
    @keyframes drift { from { transform: translateY(0); } to { transform: translateY(-150px); } }
</style>