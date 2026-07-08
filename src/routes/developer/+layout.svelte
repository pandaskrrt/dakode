<script lang="ts">
  import type { LayoutProps } from './$types';
  import { page } from '$app/stores';
  import { deserialize } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import { onMount } from 'svelte';

  let { data, children }: LayoutProps = $props();

  const menuItems = [
    { label: 'Dashboard', href: '/developer' },
    { label: 'Projects', href: '/developer/projects' },
    { label: 'Tracking Orders', href: '/developer/tracking-orders' }
  ];

  let developerName = $derived(data?.user?.name || 'Developer');
  let developerId = $derived(data?.user?.id || 0);
  let statusCounts = $derived(data?.statusCounts || {
    PENDING: 0,
    ON_PROGRESS: 0,
    REVIEW: 0,
    REVISION: 0,
    COMPLETED: 0,
    CANCELLED: 0
  });

  let developers = $derived(data?.developers || []);
  let projects = $derived(data?.projects || []);

  let pageTitle = $derived.by(() => {
    if ($page.url.pathname === '/developer/projects') return 'Projects';
    if ($page.url.pathname === '/developer/tracking-orders') return 'Tracking Orders';
    return 'Dashboard';
  });

  let activeTab = $state('All');
  let showProjectModal = $state(false);
  let showOrderModal = $state(false);

  // ==== Multi-image preview state (Create Project) ====
  const MAX_IMAGES = 5;
  let previewImages = $state<File[]>([]);
  let previewUrls = $state<string[]>([]);

  $effect(() => {
    const urls = previewImages.map((f) => URL.createObjectURL(f));
    previewUrls = urls;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  });

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const incoming = Array.from(input.files);
      previewImages = [...previewImages, ...incoming].slice(0, MAX_IMAGES);
    }
    input.value = '';
  }

  function removeImagePreview(index: number) {
    previewImages = previewImages.filter((_, i) => i !== index);
  }

  function clearImagePreview() {
    previewImages = [];
  }

  function closeProjectModal() {
    showProjectModal = false;
    clearImagePreview();
  }

  // Toast state
  let toast = $state({
    show: false,
    message: '',
    type: 'success',
    title: ''
  });

  let toastTimeout: NodeJS.Timeout;

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', title: string = '') {
    if (toastTimeout) clearTimeout(toastTimeout);

    toast.show = true;
    toast.message = message;
    toast.type = type;
    toast.title = title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information');

    toastTimeout = setTimeout(() => {
      toast.show = false;
    }, 4000);
  }

  function closeToast() {
    toast.show = false;
    if (toastTimeout) clearTimeout(toastTimeout);
  }

  let statusTabs = $derived.by(() => {
    if ($page.url.pathname === '/developer/tracking-orders') {
      return [
        { id: 'All', label: 'All Orders', color: null },
        { id: 'PENDING', label: 'Pending', color: '#6c5ce7' },
        { id: 'ON_PROGRESS', label: 'On Progress', color: '#f39c12' },
        { id: 'REVIEW', label: 'Review', color: '#2ecc71' },
        { id: 'REVISION', label: 'Revision', color: '#3498db' },
        { id: 'COMPLETED', label: 'Completed', color: '#27ae60' },
        { id: 'CANCELLED', label: 'Cancelled', color: '#e74c3c' }
      ];
    }
    if ($page.url.pathname === '/developer/projects') {
      return [
        { id: 'All', label: 'All Projects', color: null },
        { id: 'Active', label: 'Active', color: '#2ecc71' },
        { id: 'Archived', label: 'Archived', color: '#95a5a6' }
      ];
    }
    return [];
  });

  async function handleCreateProject(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Kita kontrol gambar sendiri lewat previewImages, bukan native file input
    formData.delete('images');
    formData.append('developerId', developerId.toString());
    for (const file of previewImages) {
      formData.append('images', file);
    }

    try {
      const response = await fetch('/developer/projects?/createProject', {
        method: 'POST',
        body: formData
      });

      const text = await response.text();
      const result: ActionResult = deserialize(text);
      console.log('createProject result:', result); // debug sementara, bisa dihapus nanti

      if (result.type === 'success') {
        closeProjectModal();
        showToast('Project created successfully', 'success', 'Success');
        setTimeout(() => window.location.reload(), 500);
      } else if (result.type === 'failure') {
        const errMsg = (result.data as any)?.error ?? 'Failed to create project';
        showToast(errMsg, 'error', 'Error');
      } else if (result.type === 'error') {
        showToast(result.error?.message ?? 'Unexpected server error', 'error', 'Error');
      } else if (result.type === 'redirect') {
        closeProjectModal();
        window.location.href = result.location;
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An unexpected error occurred', 'error', 'Error');
    }
  }

  async function handleCreateOrder(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/developer/tracking-orders?/createOrder', {
        method: 'POST',
        body: formData
      });

      const text = await response.text();
      const result: ActionResult = deserialize(text);
      console.log('createOrder result:', result); // debug sementara, bisa dihapus nanti

      if (result.type === 'success') {
        showOrderModal = false;
        showToast('Order created successfully', 'success', 'Success');
        setTimeout(() => window.location.reload(), 500);
      } else if (result.type === 'failure') {
        const errMsg = (result.data as any)?.error ?? 'Failed to create order';
        showToast(errMsg, 'error', 'Error');
      } else if (result.type === 'error') {
        showToast(result.error?.message ?? 'Unexpected server error', 'error', 'Error');
      } else if (result.type === 'redirect') {
        showOrderModal = false;
        window.location.href = result.location;
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An unexpected error occurred', 'error', 'Error');
    }
  }

  onMount(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showProjectModal) closeProjectModal();
        showOrderModal = false;
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  });
</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<div class="layout-wrapper">

  <div class="top-dark-panel">

    <header class="navbar">
      <div class="nav-left">
        <div class="logo-box">
          <img src="/logo/dakode-final.png" alt="Logo" class="logo" />
        </div>
        <span class="brand-name">Dakode</span>
      </div>

      <nav class="nav-middle">
        <ul>
          {#each menuItems as item}
            <li>
              <a href={item.href} class:active={$page.url.pathname === item.href}>
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="nav-right">
        <div class="user-profile-info">
          <span class="material-icons user-avatar-icon">account_circle</span>
          <span class="user-name">{developerName}</span>
        </div>
        <a href="/logout" class="logout-btn">
          <span class="material-icons">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </header>

    <div class="page-title-row">
      <h1 class="main-title">{pageTitle}</h1>

      {#if $page.url.pathname === '/developer/tracking-orders'}
        <button class="primary-action-btn" onclick={() => showOrderModal = true}>
          <span class="material-icons">add</span>
          <span>New Order</span>
        </button>
      {:else if $page.url.pathname === '/developer/projects'}
        <button class="primary-action-btn" onclick={() => showProjectModal = true}>
          <span class="material-icons">add</span>
          <span>Create Project</span>
        </button>
      {/if}
    </div>

    {#if $page.url.pathname !== '/developer'}
      <div class="filter-tabs-wrapper">
        <div class="tabs-scroll-container">
          {#each statusTabs as tab}
            <button
              class="status-tab-item"
              class:active={activeTab === tab.id}
              onclick={() => activeTab = tab.id}
            >
              {#if tab.color}
                <span class="status-dot" style="background-color: {tab.color}"></span>
              {/if}
              <span>{tab.label}</span>
              {#if tab.id !== 'All' && statusCounts[tab.id] !== undefined}
                <span class="tab-count">{statusCounts[tab.id]}</span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="tab-utility-actions">
          <button class="utility-icon-btn"><span class="material-icons">calendar_today</span></button>
          <button class="utility-icon-btn active"><span class="material-icons">splitscreen</span></button>
        </div>
      </div>
    {/if}

    {#if $page.url.pathname === '/developer'}
      <div class="stats-center-wrapper">
        <div class="stats-row">
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">Pending Orders</span>
              <span class="card-count">{statusCounts.PENDING}</span>
            </div>
            <div class="card-icon-badge purple"><span class="material-icons">assignment</span></div>
          </div>
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">On Progress</span>
              <span class="card-count">{statusCounts.ON_PROGRESS}</span>
            </div>
            <div class="card-icon-badge yellow"><span class="material-icons">hourglass_top</span></div>
          </div>
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">Review</span>
              <span class="card-count">{statusCounts.REVIEW}</span>
            </div>
            <div class="card-icon-badge green"><span class="material-icons">rate_review</span></div>
          </div>
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">Revision</span>
              <span class="card-count">{statusCounts.REVISION}</span>
            </div>
            <div class="card-icon-badge blue"><span class="material-icons">edit</span></div>
          </div>
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">Completed</span>
              <span class="card-count">{statusCounts.COMPLETED}</span>
            </div>
            <div class="card-icon-badge success"><span class="material-icons">check_circle</span></div>
          </div>
          <div class="stat-card">
            <div class="card-meta">
              <span class="card-label">Cancelled</span>
              <span class="card-count">{statusCounts.CANCELLED}</span>
            </div>
            <div class="card-icon-badge red"><span class="material-icons">cancel</span></div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <main class="bottom-content-area">
    {@render children()}
  </main>

  <!-- ========================================== -->
  <!-- MODAL CREATE PROJECT -->
  <!-- ========================================== -->
  {#if showProjectModal}
    <div class="modal-backdrop" onclick={closeProjectModal}>
      <div class="modal-container" onclick={(e) => e.stopPropagation()}>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create New Project</h2>
            <button class="close-modal-btn" onclick={closeProjectModal}>
              <span class="material-icons">close</span>
            </button>
          </div>

          <form method="POST" action="?/createProject" class="modal-form" enctype="multipart/form-data" onsubmit={handleCreateProject}>
            <div class="form-row">
              <div class="form-group">
                <label for="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  placeholder="Website Migrant Platform"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectDesc">Description</label>
                <textarea
                  id="projectDesc"
                  name="description"
                  rows="2"
                  placeholder="Describe the scope of work"
                  required
                ></textarea>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectLink">Project Link</label>
                <input
                  type="url"
                  id="projectLink"
                  name="link"
                  placeholder="https://example.com/project"
                />
                <span class="helper-text">Optional - Add a URL to your project</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectImage">Project Images ({previewImages.length}/{MAX_IMAGES})</label>
                <input
                  type="file"
                  id="projectImage"
                  name="images"
                  accept=".png,.jpg,.jpeg,.gif"
                  class="file-input"
                  multiple
                  disabled={previewImages.length >= MAX_IMAGES}
                  onchange={handleImageChange}
                />
                <span class="helper-text">Optional - Upload up to {MAX_IMAGES} images (PNG, JPG, JPEG, GIF)</span>

                {#if previewUrls.length > 0}
                  <div class="image-preview-grid">
                    {#each previewUrls as url, i}
                      <div class="image-preview-item">
                        <img src={url} alt="Preview {i + 1}" />
                        <button type="button" class="remove-preview-btn" onclick={() => removeImagePreview(i)}>
                          <span class="material-icons">close</span>
                        </button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick={closeProjectModal}>
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- ========================================== -->
  <!-- MODAL CREATE TRACKING ORDER -->
  <!-- ========================================== -->
  {#if showOrderModal}
    <div class="modal-backdrop" onclick={() => showOrderModal = false}>
      <div class="modal-container" onclick={(e) => e.stopPropagation()}>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create New Order</h2>
            <button class="close-modal-btn" onclick={() => showOrderModal = false}>
              <span class="material-icons">close</span>
            </button>
          </div>

          <form method="POST" action="?/createOrder" class="modal-form" onsubmit={handleCreateOrder}>
            <div class="form-row">
              <div class="form-group">
                <label for="orderCode">Order Code</label>
                <input
                  type="text"
                  id="orderCode"
                  name="orderCode"
                  placeholder="ORD-2024-001"
                  required
                />
                <span class="helper-text">Unique identifier for this order</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="customerName">Customer Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div class="form-group">
                <label for="customerEmail">Customer Email</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="orderProjectName">Project Name</label>
                <input
                  type="text"
                  id="orderProjectName"
                  name="projectName"
                  placeholder="E-commerce Website Development"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="orderDescription">Description</label>
                <textarea
                  id="orderDescription"
                  name="description"
                  rows="2"
                  placeholder="Detailed description of the order requirements"
                ></textarea>
                <span class="helper-text">Optional - Add more details about this order</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="orderStatus">Status</label>
                <select id="orderStatus" name="status">
                  <option value="PENDING">Pending</option>
                  <option value="ON_PROGRESS">On Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="REVISION">Revision</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div class="form-group">
                <label for="orderProgress">Progress (%)</label>
                <input
                  type="number"
                  id="orderProgress"
                  name="progress"
                  min="0"
                  max="100"
                  value="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="developerSelect">Assign Developer</label>
                <select id="developerSelect" name="developerId" required>
                  <option value="" disabled selected>Select a developer</option>
                  {#each developers as dev}
                    <option value={dev.id}>{dev.name}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" onclick={() => showOrderModal = false}>
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- ========================================== -->
  <!-- TOAST NOTIFICATION -->
  <!-- ========================================== -->
  {#if toast.show}
    <div class="toast-container">
      <div class="toast-content" class:toast-success={toast.type === 'success'} class:toast-error={toast.type === 'error'} class:toast-info={toast.type === 'info'}>
        <div class="toast-icon-wrapper">
          {#if toast.type === 'success'}
            <span class="material-icons toast-icon">check_circle</span>
          {:else if toast.type === 'error'}
            <span class="material-icons toast-icon">error</span>
          {:else}
            <span class="material-icons toast-icon">info</span>
          {/if}
        </div>
        <div class="toast-message-wrapper">
          <div class="toast-title">{toast.title}</div>
          <div class="toast-message">{toast.message}</div>
        </div>
        <button class="toast-close-btn" onclick={closeToast}>
          <span class="material-icons">close</span>
        </button>
        <div class="toast-progress-bar"></div>
      </div>
    </div>
  {/if}

</div>

<style>
  :global(body) {
    background-color: #040507;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }

  :global(body:has(.modal-backdrop)) {
    overflow: hidden;
  }

  .layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 14px 14px 0 14px;
    background-color: #040507;
  }

  .top-dark-panel {
    background: linear-gradient(135deg, #0f121d 0%, #121522 100%);
    border-radius: 24px 24px 0 0;
    padding: 24px 36px 32px 36px;
    min-height: 320px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  .nav-left { display: flex; align-items: center; gap: 12px; }
  .logo-box { background: #6c5ce7; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .logo { height: 18px; width: auto; }
  .brand-name { color: #ffffff; font-weight: 700; font-size: 1.15rem; }

  .nav-middle ul { display: flex; list-style: none; margin: 0; padding: 4px; gap: 6px; background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 14px; }
  .nav-middle a { color: #7b809a; text-decoration: none; font-size: 0.9rem; font-weight: 500; padding: 8px 20px; border-radius: 10px; display: block; transition: all 0.2s; }
  .nav-middle a:hover { color: #ffffff; background-color: rgba(255, 255, 255, 0.06); }
  .nav-middle a.active { color: #ffffff; background-color: rgba(255, 255, 255, 0.09); font-weight: 600; }

  .nav-right { display: flex; align-items: center; gap: 20px; }
  .user-profile-info { display: flex; align-items: center; gap: 8px; color: #ffffff; }
  .user-avatar-icon { color: #a0aec0; font-size: 28px; }
  .user-name { font-size: 0.92rem; font-weight: 500; }

  .logout-btn { display: flex; align-items: center; gap: 6px; background-color: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); color: #e74c3c; padding: 8px 14px; border-radius: 12px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
  .logout-btn:hover { background-color: #e74c3c; color: #ffffff; }

  .page-title-row {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    margin-bottom: 14px;
  }

  .main-title {
    color: #ffffff;
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .primary-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #6c5ce7;
    color: #ffffff;
    border: none;
    padding: 12px 22px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .primary-action-btn:hover {
    background: #5b4cc4;
    transform: translateY(-1px);
  }

  .filter-tabs-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    min-height: 68px;
  }

  .tabs-scroll-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    flex: 1;
    padding: 4px 0;
  }

  .status-tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.04);
    color: #a0aec0;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .status-tab-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }
  .status-tab-item.active {
    background: #ffffff;
    color: #040507;
    border-color: #ffffff;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
  }
  .status-tab-item.active .tab-count {
    background: rgba(4, 5, 7, 0.1);
  }

  .tab-utility-actions {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    padding: 4px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }
  .utility-icon-btn {
    background: transparent;
    border: none;
    color: #7b809a;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .utility-icon-btn .material-icons { font-size: 18px; }
  .utility-icon-btn:hover { color: #ffffff; background: rgba(255,255,255,0.05); }
  .utility-icon-btn.active { background: #ffffff; color: #040507; }

  .stats-center-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    min-height: 100px;
    margin-top: 8px;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    width: 100%;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-meta { display: flex; flex-direction: column; gap: 4px; }
  .card-label { color: #8388a2; font-size: 0.8rem; font-weight: 500; }
  .card-count { color: #ffffff; font-size: 1.6rem; font-weight: 700; line-height: 1; }

  .card-icon-badge {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .purple { background-color: rgba(114, 91, 230, 0.15); color: #8c7ae6; }
  .yellow { background-color: rgba(241, 196, 15, 0.15); color: #f1c40f; }
  .green { background-color: rgba(46, 204, 113, 0.15); color: #2ecc71; }
  .blue { background-color: rgba(52, 152, 219, 0.15); color: #3498db; }
  .success { background-color: rgba(39, 174, 96, 0.15); color: #27ae60; }
  .red { background-color: rgba(231, 76, 60, 0.15); color: #e74c3c; }

  .bottom-content-area {
    background-color: #f8f9fd;
    border-radius: 0 0 24px 24px;
    padding: 32px;
    flex-grow: 1;
    display: flex;
    gap: 32px;
  }

  /* ========================================== */
  /* MODAL STYLES */
  /* ========================================== */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-container {
    animation: slideUp 0.3s ease;
    max-width: 820px;
    width: 100%;
    margin: 20px;
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-content {
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 40px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eef2f7;
  }

  .modal-header h2 {
    color: #1a1a2e;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .close-modal-btn {
    background: transparent;
    border: none;
    color: #8b8fa7;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .close-modal-btn:hover {
    background: #f5f6fa;
    color: #1a1a2e;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-row:has(> :only-child) {
    grid-template-columns: 1fr;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    color: #4a4a5a;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 14px;
    background: #f8f9fd;
    border: 1px solid #e8ecf4;
    border-radius: 8px;
    color: #1a1a2e;
    font-size: 0.9rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    border-color: #6c5ce7;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: #a8aebd;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 60px;
  }

  .form-group select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b8fa7' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    cursor: pointer;
  }

  .helper-text {
    color: #8b8fa7;
    font-size: 0.75rem;
    margin-top: 2px;
  }

  .form-group input[disabled].file-input {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .image-preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .image-preview-item {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e8ecf4;
  }

  .image-preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .remove-preview-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }
  .remove-preview-btn .material-icons {
    font-size: 14px;
  }
  .remove-preview-btn:hover {
    background: #e74c3c;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #eef2f7;
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid #e8ecf4;
    color: #4a4a5a;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
  }
  .btn-secondary:hover {
    background: #f5f6fa;
    border-color: #d0d5e0;
  }

  .btn-primary {
    background: #6c5ce7;
    border: none;
    color: #ffffff;
    padding: 10px 28px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
  }
  .btn-primary:hover {
    background: #5b4cc4;
  }

  /* ========================================== */
  /* TOAST NOTIFICATION */
  /* ========================================== */
  .toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 10000;
    max-width: 400px;
    width: 100%;
    animation: slideIn 0.4s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast-content {
    background: #ffffff;
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    position: relative;
    overflow: hidden;
    border-left: 4px solid;
  }

  .toast-success {
    border-left-color: #2ecc71;
  }
  .toast-success .toast-icon {
    color: #2ecc71;
  }

  .toast-error {
    border-left-color: #e74c3c;
  }
  .toast-error .toast-icon {
    color: #e74c3c;
  }

  .toast-info {
    border-left-color: #3498db;
  }
  .toast-info .toast-icon {
    color: #3498db;
  }

  .toast-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #f5f6fa;
  }

  .toast-icon {
    font-size: 20px;
  }

  .toast-message-wrapper {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    color: #1a1a2e;
    font-weight: 600;
    font-size: 0.85rem;
    margin-bottom: 1px;
  }

  .toast-message {
    color: #6a6a7a;
    font-size: 0.8rem;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .toast-close-btn {
    background: transparent;
    border: none;
    color: #8b8fa7;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .toast-close-btn:hover {
    background: #f5f6fa;
    color: #1a1a2e;
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: #6c5ce7;
    animation: progress 4s linear forwards;
  }

  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .stats-row { grid-template-columns: repeat(3, 1fr); }
  }

  @media (max-width: 1024px) {
    .top-dark-panel { height: auto; padding-bottom: 24px; }
    .stats-center-wrapper { height: auto; }
    .stats-row { grid-template-columns: repeat(3, 1fr); }
    .bottom-content-area { flex-direction: column; }
    .page-title-row { flex-direction: column; align-items: flex-start; gap: 16px; height: auto; margin-top: 24px; }
    .filter-tabs-wrapper { flex-direction: column; align-items: flex-start; height: auto; gap: 12px; }
    .tab-utility-actions { width: 100%; justify-content: flex-end; }
  }

  @media (max-width: 768px) {
    .navbar { flex-direction: column; height: auto; gap: 12px; }
    .nav-middle ul { flex-wrap: wrap; justify-content: center; }
    .nav-right { flex-wrap: wrap; justify-content: center; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .form-row { grid-template-columns: 1fr; }
    .top-dark-panel { padding: 16px; }
    .bottom-content-area { padding: 16px; }
    .modal-content { padding: 24px; }
    .toast-container { top: 16px; right: 16px; left: 16px; max-width: none; }
  }

  @media (max-width: 480px) {
    .stats-row { grid-template-columns: 1fr; }
    .page-title-row .main-title { font-size: 1.5rem; }
    .primary-action-btn { padding: 10px 16px; font-size: 0.8rem; }
    .status-tab-item { padding: 8px 14px; font-size: 0.8rem; }
    .modal-header h2 { font-size: 1.1rem; }
  }
</style>