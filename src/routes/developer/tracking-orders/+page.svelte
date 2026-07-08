<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // State untuk melacak filter checkbox status yang aktif
  let selectedStatuses = $state({
    PENDING: true,
    ON_PROGRESS: true,
    REVIEW: true,
    REVISION: true,
    COMPLETED: false,
    CANCELLED: false
  });

  // State filter berdasarkan waktu / tipe sorting
  let timeFilter = $state('recent');

  // Auto-reactive filtering data dari Prisma
  let filteredOrders = $derived(
    (data.orders || []).filter(order => selectedStatuses[order.status as keyof typeof selectedStatuses])
  );

  // Helper pewarnaan badge status sesuai gambar referensi asli
  function getStatusClass(status: string) {
    switch (status) {
      case 'PENDING': return 'status-badge new';
      case 'ON_PROGRESS': return 'status-badge progress';
      case 'REVIEW': return 'status-badge review';
      case 'REVISION': return 'status-badge revision';
      case 'COMPLETED': return 'status-badge completed';
      default: return 'status-badge cancelled';
    }
  }

  function formatStatusText(status: string) {
    if (!status) return '';
    return status.replace('_', ' ').toLowerCase();
  }
</script>

<aside class="filter-sidebar-card">
  <h2 class="sidebar-title">Filters</h2>

  <div class="filter-group">
    <h3>Order Status</h3>
    <label class="checkbox-container">
      <input type="checkbox" bind:checked={selectedStatuses.PENDING} />
      <span class="checkmark"></span> New / Pending
    </label>
    <label class="checkbox-container">
      <input type="checkbox" bind:checked={selectedStatuses.ON_PROGRESS} />
      <span class="checkmark"></span> On Progress
    </label>
    <label class="checkbox-container">
      <input type="checkbox" bind:checked={selectedStatuses.REVIEW} />
      <span class="checkmark"></span> Ready to Review
    </label>
    <label class="checkbox-container">
      <input type="checkbox" bind:checked={selectedStatuses.CANCELLED} />
      <span class="checkmark"></span> Cancelled
    </label>
  </div>

  <div class="filter-group no-margin">
    <h3>Filter by</h3>
    <label class="radio-container">
      <input type="radio" name="timeFilter" value="recent" bind:group={timeFilter} />
      <span class="radiomark"></span> Recent orders
    </label>
    <label class="radio-container">
      <input type="radio" name="timeFilter" value="today" bind:group={timeFilter} />
      <span class="radiomark"></span> Today
    </label>
  </div>
</aside>

<div class="orders-grid-container">
  {#if filteredOrders.length === 0}
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      <p>No orders match the selected filters.</p>
    </div>
  {:else}
    <div class="orders-grid">
      {#each filteredOrders as order (order.id)}
        <div class="order-card">
          <div class="card-header">
            <div class="client-info">
              <div class="avatar-wrapper">
                {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div class="client-meta">
                <h4 class="client-name">{order.customerName}</h4>
                <span class="order-code">Code #{order.orderCode}</span>
              </div>
            </div>
            <span class={getStatusClass(order.status)}>
              {formatStatusText(order.status)}
            </span>
          </div>

          <div class="card-body">
            <div class="item-list-section">
              <div class="item-row">
                <div class="item-detail">
                  <span class="item-title">{order.projectName}</span>
                  <span class="item-subtitle">Assigned to: <strong>{order.developerName || 'Unassigned'}</strong></span>
                </div>
                <span class="item-qty">1x</span>
              </div>
            </div>

            <div class="progress-section">
              <div class="progress-header">
                <span class="progress-label">Production Progress</span>
                <span class="progress-val">{order.progress}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: {order.progress}%"></div>
              </div>
            </div>

            <div class="order-notes-box">
              <span class="notes-heading">Order Notes</span>
              <p class="notes-text">
                {order.lastNote ? `"${order.lastNote}"` : 'No specific requirements or notes added.'}
              </p>
            </div>
          </div>

          <div class="card-footer">
            <a href="/developer/tracking-orders/{order.id}" class="details-action-btn">
              <span>Order details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* GLOBAL CONTAINER SETUP */
  :global(.bottom-content-area) {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    padding: 24px;
    background-color: #f8fafc !important; /* Latar abu-abu super bersih premium */
    min-height: 100vh;
    box-sizing: border-box;
  }

  /* SIDEBAR FILTER STYLING */
  .filter-sidebar-card {
    width: 280px;
    flex-shrink: 0;
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(148, 163, 184, 0.06);
    border: 1px solid #e2e8f0;
    box-sizing: border-box;
  }

  .sidebar-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 24px 0;
  }

  .filter-group {
    margin-bottom: 28px;
  }
  
  .filter-group.no-margin {
    margin-bottom: 0;
  }

  .filter-group h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    margin: 0 0 16px 0;
    font-weight: 700;
  }

  /* ACCESSIBLE CHECKBOX & RADIO STYLES */
  .checkbox-container, .radio-container {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 32px;
    margin-bottom: 16px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #334155;
    font-weight: 600;
    user-select: none;
  }

  .checkbox-container:last-child, .radio-container:last-child {
    margin-bottom: 0;
  }

  .checkbox-container input, .radio-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark, .radiomark {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    height: 20px;
    width: 20px;
    background-color: #ffffff;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .radiomark { border-radius: 50%; }

  .checkbox-container:hover input ~ .checkmark,
  .radio-container:hover input ~ .radiomark {
    border-color: #6c5ce7;
  }

  .checkbox-container input:checked ~ .checkmark {
    background-color: #6c5ce7;
    border-color: #6c5ce7;
  }

  .radio-container input:checked ~ .radiomark {
    border-color: #6c5ce7;
    background-color: #ffffff;
  }

  .radio-container input:checked ~ .radiomark::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #6c5ce7;
  }

  .checkmark::after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .checkbox-container input:checked ~ .checkmark::after { display: block; }

  /* ORDERS GRID CONTAINER */
  .orders-grid-container {
    flex-grow: 1;
    width: 100%;
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  /* MODERN PRESET CARD DESIGN */
  .order-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 4px 18px rgba(148, 163, 184, 0.04);
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: space-between;
    min-height: 380px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
  }

  .order-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(148, 163, 184, 0.12);
  }

  /* CARD HEADER */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e2e8f0;
    margin-bottom: 16px;
  }

  .client-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar-wrapper {
    width: 44px;
    height: 44px;
    background-color: #ffeaa7; /* Warna pastel estetik */
    color: #d35400;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .client-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .client-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
  }

  .order-code {
    font-size: 0.78rem;
    color: #94a3b8;
    font-weight: 500;
  }

  /* STATUS BADGES PER COUNTER */
  .status-badge {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }

  .status-badge.new { background: #e0e7ff; color: #4338ca; }
  .status-badge.progress { background: #fef9c3; color: #a16207; }
  .status-badge.review { background: #dcfce7; color: #15803d; }
  .status-badge.revision { background: #ffedd5; color: #c2410c; }
  .status-badge.completed { background: #e0f2fe; color: #0369a1; }
  .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }

  /* CARD BODY & DETAILS */
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-grow: 1;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .item-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
  }

  .item-subtitle {
    font-size: 0.82rem;
    color: #64748b;
  }

  .item-qty {
    font-size: 0.9rem;
    font-weight: 700;
    color: #334155;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 6px;
  }

  /* PROGRESS TRACKER */
  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
  }

  .progress-val {
    color: #0f172a;
    font-weight: 700;
  }

  .progress-bar-bg {
    width: 100%;
    height: 8px;
    background-color: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background-color: #6c5ce7;
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  /* NOTES BOX TYPE WRAPPER */
  .order-notes-box {
    background-color: #f8fafc;
    border-radius: 14px;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
  }

  .notes-heading {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .notes-text {
    margin: 0;
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.4;
    font-style: italic;
  }

  /* FULL WIDTH SOLID BUTTON */
  .card-footer {
    margin-top: 16px;
  }

  .details-action-btn {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #0f172a; /* Warna gelap solid */
    color: #ffffff;
    text-decoration: none;
    padding: 12px;
    border-radius: 14px;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background-color 0.2s ease;
  }

  .details-action-btn:hover {
    background-color: #1e293b;
  }

  /* EMPTY STATE */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #94a3b8;
    padding: 80px 0;
    gap: 12px;
    width: 100%;
  }

  /* RESPONSIVE LAYOUT BREAKPOINTS */
  @media (max-width: 900px) {
    :global(.bottom-content-area) {
      flex-direction: column;
    }
    .filter-sidebar-card {
      width: 100%;
    }
  }
</style>