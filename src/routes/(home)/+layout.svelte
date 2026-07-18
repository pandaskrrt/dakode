<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { magneticButton } from '$lib/actions/magneticButton';

  // Menerima slot halaman dari SvelteKit v5 secara reaktif
  let { children } = $props();

  let isGlitching = $state(true);
  let isDarkMode = $state(true);
  let isSearchOpen = $state(false); 
  let isMobileMenuOpen = $state(false); 
  let currentPath = $derived($page.url.pathname);

  function toggleTheme(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty('--clip-x', `${x}px`);
    document.documentElement.style.setProperty('--clip-y', `${y}px`);
    document.documentElement.style.setProperty('--clip-r', `${endRadius}px`);

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    } else {
      isDarkMode = !isDarkMode;
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isSearchOpen = false;
    }
  }

  onMount(() => {
    // Default tema: dark mode, kecuali sudah ada preferensi 'light' tersimpan di class html
    if (!document.documentElement.classList.contains('light-forced')) {
      document.documentElement.classList.add('dark');
      isDarkMode = true;
    } else {
      isDarkMode = document.documentElement.classList.contains('dark');
    }
    const timer = setTimeout(() => { isGlitching = false; }, 900);
    return () => clearTimeout(timer);
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- WADAH GLOBAL LAYOUT UTAMA -->
<div class="relative min-h-screen w-full overflow-hidden bg-zinc-50 transition-colors duration-500 dark:bg-zinc-950">
    
    <!-- ================= 1. LAYER GLOBAL BACKGROUND & ANIMASI LAMPU/BINTANG ================= -->
    <div class="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block select-none z-0">
        <!-- Sorotan Lampu Tebal (Dikunci Presisi di Kiri Atas Sejajar Titik Logo) -->
        <div class="spotlight-beam absolute inset-0"></div>

        <!-- Animasi Partikel Bintang Bergerak Lambat Sesuai Referensi -->
        <div class="stars-container absolute inset-0 opacity-40">
            <div class="stars-layer-1"></div>
            <div class="stars-layer-2"></div>
        </div>
    </div>

    <!-- ================= 2. NAVIGASI UTAMA (FIXED/ABSOLUTE DI ATAS) ================= -->
    <nav class="absolute top-0 left-0 z-50 w-full bg-transparent px-4 py-4 md:px-6">
      <div 
        class="mx-auto flex max-w-380 items-center justify-between transition-all duration-500"
        class:glitch-container={isGlitching}
      >
        <div class="flex items-center gap-4">
          <a 
            href="/"
            class="group relative flex h-9 inline-flex items-center gap-2 rounded-full border border-gray-200/60 bg-white/40 px-3.5 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 hover:border-gray-400/50 dark:border-zinc-800/60 dark:bg-zinc-950/40 dark:hover:bg-zinc-900/80 dark:hover:border-zinc-600/50 shadow-sm"
            class:glitch-element={isGlitching}
            data-text="dakode"
          >
            <img 
              src="/logo/dakode-final.png" 
              alt="Logo dakode" 
              class="h-5 w-5 rounded-full object-cover transition-transform duration-500 group-hover:rotate-12"
            />
            
            <div class="relative hidden md:grid h-5 overflow-hidden text-sm font-semibold tracking-tight">
              <span class="col-start-1 row-start-1 block text-gray-900 transition-all duration-300 group-hover:-translate-y-full group-hover:opacity-0 dark:text-white">
                dakode
              </span>
              <span class="col-start-1 row-start-1 block translate-y-full text-gray-900 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:text-white">
                home
              </span>
            </div>
          </a>

          <div class="hidden md:flex h-9 items-center gap-1 rounded-full border border-gray-200/60 bg-white/40 p-1 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/40">
            <a href="/#projects" class="flex h-full items-center rounded-full px-4 text-sm font-medium transition duration-200 text-gray-600 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-white">
              Project
            </a>
            <a href="/track-orders" class="flex h-full items-center rounded-full px-4 text-sm font-medium transition duration-200 {currentPath === '/track-orders' ? 'bg-white shadow text-gray-950 dark:bg-zinc-800 dark:text-white' : 'text-gray-600 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-white'}">
              Track Order
            </a>
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <button 
            type="button" 
            onclick={toggleTheme}
            class="relative flex h-9 w-16 items-center rounded-full border border-gray-200 bg-white/60 p-1 text-gray-600 shadow-inner backdrop-blur-sm hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Toggle theme"
          >
            <div 
              class="absolute h-7 w-7 rounded-full bg-white shadow transition-all duration-500 dark:bg-zinc-800 flex items-center justify-center"
              class:translate-x-0={!isDarkMode}
              class:translate-x-7={isDarkMode}
            >
              {#if !isDarkMode}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              {/if}
            </div>
          </button>

          <button 
            type="button"
            onclick={() => isSearchOpen = true}
            class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/60 text-gray-600 shadow-sm backdrop-blur-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>

            <a
             href="/#contact"
             use:magneticButton
             class="hidden md:flex h-9 items-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-md"
           >
             Contact
           </a>

          <button 
            type="button"
            onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
            class="flex md:hidden h-9 w-9 flex-col items-center justify-center gap-[4px] rounded-full border border-gray-200 bg-white/60 text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
            aria-label="Toggle menu"
          >
            <span class="h-[2px] w-4 rounded-full bg-current transition-all duration-300 ease-in-out" class:translate-y-[6px]={isMobileMenuOpen} class:rotate-45={isMobileMenuOpen}></span>
            <span class="h-[2px] w-4 rounded-full bg-current transition-all duration-300 ease-in-out" class:opacity-0={isMobileMenuOpen} class:scale-x-0={isMobileMenuOpen}></span>
            <span class="h-[2px] w-4 rounded-full bg-current transition-all duration-300 ease-in-out" class:-translate-y-[6px]={isMobileMenuOpen} class:-rotate-45={isMobileMenuOpen}></span>
          </button>
        </div>
      </div>

      {#if isMobileMenuOpen}
        <div class="mt-2 flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white/80 p-3 backdrop-blur-md shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950/80 md:hidden animate-container">
          <a href="/#projects" onclick={() => isMobileMenuOpen = false} class="animate-item rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors duration-200" style="--delay: 1;">Project</a>
          <a href="/track-orders" onclick={() => isMobileMenuOpen = false} class="animate-item rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors duration-200" style="--delay: 2;">Track Order</a>
          <a href="/#contact" onclick={() => isMobileMenuOpen = false} class="animate-item rounded-xl bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-black shadow-md active:scale-95 transition-all duration-250" style="--delay: 3;">Contact</a>
        </div>
      {/if}
    </nav>

    <!-- ================= 3. TEMPAT MENGEKSEKUSI SLOT HALAMAN (CHILDREN) ================= -->
    <!-- Z-index 10 memastikan area interaksi teks dan tombol halaman berada di atas layer background lampu -->
    <div class="relative z-10 w-full">
        {#if children}
            {@render children()}
        {/if}
    </div>
</div>

<!-- ================= MODAL SEARCH GLOBAL ================= -->
{#if isSearchOpen}
  <div class="fixed inset-0 z-[100] bg-gray-950/20 backdrop-blur-md dark:bg-black/40 flex items-start justify-center p-4 pt-24 md:pt-32" onclick={() => isSearchOpen = false}>
    <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900" onclick={(e) => e.stopPropagation()}>
      <div class="relative flex items-center px-4 py-4 border-b border-gray-100 dark:border-zinc-800">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 dark:text-zinc-500 mr-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Search templates, creators..." class="w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-zinc-500" autofocus />
        <button type="button" onclick={() => isSearchOpen = false} class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="px-6 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">Start typing to search Framer templates and creators.</div>
    </div>
  </div>
{/if}

<style>
  /* --- REKAYASA KREATIF: PARTIKEL BINTANG BERGERAK HALUS (ANTI-LAG) --- */
  .stars-layer-1 {
    width: 1.5px;
    height: 1.5px;
    border-radius: 50%;
    background: white;
    box-shadow: 
        24vw 15vh 1px rgba(255,255,255,0.8), 75vw 35vh 1.5px rgba(255,255,255,0.6),
        12vw 65vh 1px rgba(255,255,255,0.4), 85vw 78vh 2px rgba(255,255,255,0.7),
        45vw 45vh 1px rgba(255,255,255,0.5), 60vw 85vh 1px rgba(255,255,255,0.9),
        90vw 15vh 1px rgba(255,255,255,0.3), 30vw 80vh 2px rgba(255,255,255,0.6);
    animation: moveStarsSlow 70s linear infinite;
  }

  .stars-layer-2 {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: white;
    box-shadow: 
        5vw 25vh 1px rgba(255,255,255,0.5), 65vw 15vh 2px rgba(255,255,255,0.7),
        38vw 70vh 1px rgba(255,255,255,0.4), 80vw 55vh 1.5px rgba(255,255,255,0.8),
        52vw 12vh 1px rgba(255,255,255,0.6), 95vw 68vh 1px rgba(255,255,255,0.5),
        20vw 50vh 2px rgba(255,255,255,0.7), 70vw 90vh 1px rgba(255,255,255,0.4);
    animation: moveStarsFast 45s linear infinite;
  }

  @keyframes moveStarsSlow {
    from { transform: translateY(0px) rotate(0deg); }
    to { transform: translateY(-150px) rotate(3deg); }
  }

  @keyframes moveStarsFast {
    from { transform: translateY(0px) rotate(0deg); }
    to { transform: translateY(-250px) rotate(-5deg); }
  }

  /* --- TRANSISI THEME RADIAL REVEAL --- */
  :root { --clip-x: 0px; --clip-y: 0px; --clip-r: 0px; }
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
  ::view-transition-new(root) {
    clip-path: circle(0px at var(--clip-x) var(--clip-y));
    animation: radialReveal 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    z-index: 999;
  }
  @keyframes radialReveal {
    from { clip-path: circle(0px at var(--clip-x) var(--clip-y)); }
    to { clip-path: circle(var(--clip-r) at var(--clip-x) var(--clip-y)); }
  }

  /* --- MOBILE ANIMATION CONTROLS --- */
  .animate-container { animation: menuPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  @keyframes menuPopIn {
    0% { opacity: 0; transform: scale(0.92) translateY(-10px); transform-origin: top right; }
    100% { opacity: 1; transform: scale(1) translateY(0); transform-origin: top right; }
  }
  .animate-item {
    opacity: 0; transform: translateY(12px);
    animation: itemFadeIn 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
    animation-delay: calc(var(--delay) * 60ms + 100ms);
  }
  @keyframes itemFadeIn { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }

  /* --- GLITCH SYSTEM --- */
  .glitch-container { animation: shakeIntro 0.6s cubic-bezier(.36,.07,.19,.97) both; transform: translate3d(0, 0, 0); }
  .glitch-element { position: relative; }
  .glitch-element::before, .glitch-element::after {
    content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: transparent; display: flex; align-items: center; padding-left: 2.15rem;
    font-weight: 600; font-size: 0.875rem; clip-path: inset(0 0 0 0);
  }
  .glitch-element::before { left: 2px; text-shadow: -2px 0 #ff00c1; animation: glitchLines 0.8s infinite linear alternate-reverse; }
  .glitch-element::after { left: -2px; text-shadow: -2px 0 #00fff0, 0 2px #39ff14; animation: glitchLines2 0.5s infinite linear alternate-reverse; }
  @keyframes shakeIntro {
    10%, 90% { transform: translate3d(-1px, 2px, 0) scale(1.01); }
    20%, 80% { transform: translate3d(2px, -1px, 0); opacity: 0.8; }
    30%, 50%, 70% { transform: translate3d(-3px, 1px, 0); }
    40%, 60% { transform: translate3d(3px, -2px, 0) scale(0.99); opacity: 0.9; }
  }
  @keyframes glitchLines {
    0% { clip-path: inset(40% 0 61% 0); } 20% { clip-path: inset(92% 0 1% 0); }
    40% { clip-path: inset(15% 0 80% 0); } 60% { clip-path: inset(80% 0 5% 0); }
    80% { clip-path: inset(3% 0 92% 0); } 100% { clip-path: inset(55% 0 21% 0); }
  }
  @keyframes glitchLines2 {
    0% { clip-path: inset(25% 0 58% 0); } 30% { clip-path: inset(70% 0 15% 0); }
    50% { clip-path: inset(5% 0 85% 0); } 70% { clip-path: inset(88% 0 3% 0); }
    100% { clip-path: inset(40% 0 43% 0); }
  }
</style>

