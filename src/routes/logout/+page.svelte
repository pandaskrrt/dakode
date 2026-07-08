<script lang="ts">
  import { onMount } from 'svelte';

  let startAnimation = $state(false);
  let triggerRedirect = $state(false);
  let formElement: HTMLFormElement;

  // State untuk baris-baris log terminal
  let terminalLogs = $state<string[]>([]);
  
  const bootSequences = [
    'dakode@system:~# initiate --logout',
    '[ OK ] Verifying developer active session...',
    '[ OK ] Revoking JWT authentication token...',
    '[ WARN ] Disconnecting Prisma Client connection...',
    '[ OK ] Clearing local storage and session state...',
    '[ SUCCESS ] Session destroyed successfully.',
    'dakode@system:~# exit'
  ];

  onMount(() => {
    // 1. Munculkan logo utama
    setTimeout(() => {
      startAnimation = true;
    }, 200);

    // 2. Jalankan efek pengetikan/kemunculan baris kode ala terminal secara berurutan
    bootSequences.forEach((log, index) => {
      setTimeout(() => {
        terminalLogs = [...terminalLogs, log];
      }, 300 * (index + 1)); // Setiap baris muncul bergantian per 300ms
    });

    // 3. Setelah proses log simulasi coding selesai, eksekusi redirect
    setTimeout(() => {
      triggerRedirect = true;
      
      setTimeout(() => {
        formElement?.submit();
      }, 500); // Efek fade out keluar yang halus
    }, 3200); // Total durasi disesuaikan dengan baris terminal
  });
</script>

<div class="logout-screen" class:fade-out={triggerRedirect}>
  <form id="logout-form" method="POST" action="?/execute" bind:this={formElement}></form>

  <div class="main-display-container">
    <div class="animation-container">
      <div class="logo-highlight-box" class:glow-active={startAnimation}>
        <img src="/logo/dakode-final.png" alt="Logo" class="brand-logo" />
      </div>

      <div class="text-splitter" class:expand={startAnimation}>
        <span class="divider">|</span>
        <span class="logout-text">logout</span>
      </div>
    </div>

    <div class="terminal-box" class:visible={startAnimation}>
      <div class="terminal-header">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="terminal-title">bash - session_destroy.sh</span>
      </div>
      <div class="terminal-body">
        {#each terminalLogs as log}
          <div class="log-line" class:system-prompt={log.startsWith('dakode')} class:success-prompt={log.includes('SUCCESS')}>
            {log}
          </div>
        {/each}
        {#if terminalLogs.length < bootSequences.length}
          <div class="cursor">_</div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* Layar Full Background Gelap Solid nan Mewah */
  .logout-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, #0f121d 0%, #040507 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logout-screen.fade-out {
    opacity: 0;
    transform: scale(1.03) translateY(-4px);
  }

  /* Susunan vertikal: Logo di atas, terminal di bawah */
  .main-display-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    width: 100%;
    max-width: 450px;
    padding: 20px;
    box-sizing: border-box;
  }

  .animation-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
  }

  /* Box Pemancar Efek Highlight Glow di Sekitar Logo */
  .logo-highlight-box {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 10px;
    animation: logoPopEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .logo-highlight-box::before {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    background: #6c5ce7;
    border-radius: 50%;
    filter: blur(25px);
    opacity: 0;
    transform: scale(0.6);
    transition: opacity 0.8s ease, transform 0.8s ease;
    z-index: -1;
  }

  .logo-highlight-box.glow-active::before {
    opacity: 0.45;
    transform: scale(1.1);
  }

  .brand-logo {
    height: 42px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  }

  /* Efek Pembelahan Teks Samping */
  .text-splitter {
    display: flex;
    align-items: center;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: max-width 0.9s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.7s ease-in-out;
  }

  .text-splitter.expand {
    max-width: 220px;
    opacity: 1;
    margin-left: 6px;
  }

  .divider {
    color: rgba(255, 255, 255, 0.18);
    font-size: 2.2rem;
    margin: 0 18px;
    font-weight: 300;
    user-select: none;
  }

  .logout-text {
    color: #ffffff;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: lowercase;
  }

  /* TAMPILAN MINI TERMINAL KODE (BOOTING) */
  .terminal-box {
    width: 100%;
    background: rgba(10, 12, 22, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.6s ease, transform 0.6s ease;
    font-family: 'Courier New', Courier, monospace;
  }

  .terminal-box.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .terminal-header {
    background: rgba(255, 255, 255, 0.03);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }

  .terminal-title {
    color: #4f566b;
    font-size: 0.75rem;
    margin-left: 6px;
  }

  .terminal-body {
    padding: 16px;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-sizing: border-box;
  }

  .log-line {
    font-size: 0.78rem;
    color: #a29bfe; /* Warna teks default ungu pastel dev */
    line-height: 1.4;
    white-space: pre-wrap;
  }

  /* Modifikasi pewarnaan log terminal agar interaktif */
  .log-line.system-prompt {
    color: #6c5ce7;
    font-weight: bold;
  }

  .log-line.success-prompt {
    color: #2ecc71;
  }

  .cursor {
    display: inline-block;
    font-size: 0.8rem;
    color: #6c5ce7;
    animation: blink 0.8s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  @keyframes logoPopEntrance {
    0% { opacity: 0; transform: scale(0.6); }
    100% { opacity: 1; transform: scale(1); }
  }
</style>