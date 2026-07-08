<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let totalOrders = $derived(data.totalOrders || 0);
  let totalProjects = $derived(data.totalProjects || 0);
  let totalActiveOrders = $derived(data.totalActiveOrders || 0);
  let completionRate = $derived(data.completionRate || 0);
  let recentOrders = $derived(data.recentOrders || []);
  let activityData = $derived(data.activityData || []);
  let statusCounts = $derived(data.statusCounts || { 
    PENDING: 0, 
    ON_PROGRESS: 0, 
    REVIEW: 0, 
    REVISION: 0, 
    COMPLETED: 0, 
    CANCELLED: 0 
  });

  function formatDate(date: any) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      'PENDING': 'Pending',
      'ON_PROGRESS': 'On progress',
      'REVIEW': 'Review',
      'REVISION': 'Revision',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'PENDING': '#8b5cf6',
      'ON_PROGRESS': '#f59e0b',
      'REVIEW': '#10b981',
      'REVISION': '#3b82f6',
      'COMPLETED': '#059669',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  function getInitials(name: string) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getActivityLevel(level: number): string {
    const levels = ['lv0', 'lv1', 'lv2', 'lv3', 'lv4'];
    return levels[level] || levels[0];
  }

  function getWeeks() {
    const weeks: any[] = [];
    for (let i = 0; i < activityData.length; i += 7) {
      weeks.push(activityData.slice(i, i + 7));
    }
    return weeks;
  }

  const weeks = getWeeks();
  const days = ['Mon', 'Wed', 'Fri'];
  
  function getMonthLabels() {
    const months: string[] = [];
    let currentMonth = '';
    activityData.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      if (index % 7 === 0 && month !== currentMonth) {
        months.push(month);
        currentMonth = month;
      } else if (index % 7 === 0) {
        months.push('');
      }
    });
    return months;
  }

  const monthLabels = getMonthLabels();
  const totalContributions = activityData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = activityData.filter(d => d.count > 0).length;
</script>

<div class="dash">
  
  <!-- Stats Row -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon" style="background:#EEEDFE">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7h-4a2 2 0 0 1-2-2V1"/>
          <path d="M4 7V4a2 2 0 0 1 2-2h7l7 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
          <path d="M8 13h8"/>
          <path d="M8 17h5"/>
        </svg>
      </div>
      <div class="stat-label">Tracking orders</div>
      <div class="stat-value">{totalActiveOrders}</div>
      <div class="stat-change">Total: {totalOrders} orders</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#E6F1FB">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="stat-label">Projects</div>
      <div class="stat-value">{totalProjects}</div>
      <div class="stat-change">Active projects</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#EAF3DE">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#639922" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <div class="stat-label">Completion rate</div>
      <div class="stat-value">{completionRate}%</div>
      <div class="stat-change up">↑ 4% this month</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background:#FAEEDA">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF9F27" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      </div>
      <div class="stat-label">Active days</div>
      <div class="stat-value">{activeDays}</div>
      <div class="stat-change">Last 30 days</div>
    </div>
  </div>

  <!-- Main Layout -->
  <div class="main-grid">
    
    <!-- Left: Recent Orders Table -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Recent orders</div>
          <div class="card-sub">Latest tracking orders</div>
        </div>
        <a href="/developer/tracking-orders" class="link-btn">
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Project</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {#each recentOrders as order}
            <tr>
              <td style="font-weight:500;font-size:12px;color:var(--color-text-secondary)">{order.orderCode || 'ORD-000'}</td>
              <td>
                <div class="customer-cell">
                  <div class="avatar">{getInitials(order.customerName)}</div>
                  <span style="font-size:13px">{order.customerName || 'Unknown'}</span>
                </div>
              </td>
              <td style="color:var(--color-text-secondary);font-size:13px">{order.projectName || 'Untitled'}</td>
              <td>
                <div class="prog-wrap">
                  <div class="prog-num">{order.progress}%</div>
                  <div class="prog-track">
                    <div class="prog-fill" style="width: {order.progress}%"></div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" style="background:{getStatusColor(order.status)}18;color:{getStatusColor(order.status)}">
                  <span style="width:5px;height:5px;border-radius:50%;background:{getStatusColor(order.status)};display:inline-block"></span>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td class="date-col">{formatDate(order.createdAt)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      
      <!-- Heatmap / Activity Chart -->
      <div class="heatmap-card">
        <div class="hm-header">
          <div class="hm-title">Activity</div>
          <div class="hm-sub">{totalContributions} contributions in the last 30 days</div>
        </div>
        <div class="hm-body">
          <div class="hm-month-row">
            {#each monthLabels as month}
              <span class="hm-month-label">{month}</span>
            {/each}
          </div>
          <div class="hm-grid">
            <div class="hm-days">
              {#each days as day}
                <div class="hm-day">{day}</div>
              {/each}
            </div>
            <div style="display:flex;gap:3px;">
              {#each weeks as week}
                <div class="hm-col">
                  {#each week as day}
                    {@const level = day?.level || 0}
                    {@const count = day?.count || 0}
                    <div 
                      class="hm-cell {getActivityLevel(level)}" 
                      title="{day?.date || ''}: {count} order{count !== 1 ? 's' : ''}"
                    ></div>
                  {/each}
                </div>
              {/each}
            </div>
          </div>
          <div class="hm-legend">
            <span class="hm-leg-label">Less</span>
            <div class="hm-leg-cells">
              <div class="hm-leg-cell lv0"></div>
              <div class="hm-leg-cell lv1"></div>
              <div class="hm-leg-cell lv2"></div>
              <div class="hm-leg-cell lv3"></div>
              <div class="hm-leg-cell lv4"></div>
            </div>
            <span class="hm-leg-label">More</span>
          </div>
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="status-card">
        <div class="status-title">Status distribution</div>
        {#each Object.entries(statusCounts) as [status, count]}
          {#if count > 0}
            {@const color = getStatusColor(status)}
            {@const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}
            <div class="status-row">
              <div class="status-dot" style="background:{color}"></div>
              <span class="status-name">{getStatusLabel(status)}</span>
              <div class="status-track">
                <div class="status-fill" style="width:{pct}%;background:{color}"></div>
              </div>
              <span class="status-count">{count}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>

  </div>
</div>

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --color-background-primary: #ffffff;
    --color-background-secondary: #f0f2f5;
    --color-text-primary: #1a1a2e;
    --color-text-secondary: #4a4a5a;
    --color-text-tertiary: #8b8fa7;
    --color-border-tertiary: #e8ecf0;
    --border-radius-lg: 12px;
    --border-radius-md: 8px;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .dash {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: var(--font-sans);
    background: #f6f8fa;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--border-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .stat-icon svg {
    width: 18px;
    height: 18px;
  }

  .stat-label {
    font-size: 11px;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.1;
  }

  .stat-change {
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }

  .stat-change.up {
    color: #16a34a;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    align-items: start;
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .card-sub {
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }

  .link-btn {
    font-size: 12px;
    color: var(--color-text-secondary);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-md);
    padding: 4px 10px;
    transition: background 0.15s;
  }

  .link-btn:hover {
    background: var(--color-background-secondary);
  }

  .link-btn svg {
    width: 14px;
    height: 14px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead th {
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-bottom: 0.5px solid var(--color-border-tertiary);
    text-align: left;
  }

  tbody td {
    padding: 10px 10px;
    font-size: 13px;
    color: var(--color-text-primary);
    border-bottom: 0.5px solid var(--color-border-tertiary);
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  .customer-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #EEEDFE;
    color: #534AB7;
    font-size: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .prog-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 80px;
  }

  .prog-num {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .prog-track {
    height: 3px;
    background: var(--color-background-secondary);
    border-radius: 2px;
    overflow: hidden;
  }

  .prog-fill {
    height: 100%;
    background: #7F77DD;
    border-radius: 2px;
  }

  .date-col {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }

  .heatmap-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 16px;
  }

  .hm-header {
    margin-bottom: 10px;
  }

  .hm-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .hm-sub {
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }

  .hm-body {
    overflow-x: auto;
  }

  .hm-month-row {
    display: flex;
    padding-left: 22px;
    margin-bottom: 3px;
    gap: 3px;
  }

  .hm-month-label {
    font-size: 9px;
    color: var(--color-text-tertiary);
    flex: 1;
    min-width: 12px;
  }

  .hm-grid {
    display: flex;
    gap: 3px;
  }

  .hm-days {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-right: 4px;
    padding-top: 2px;
  }

  .hm-day {
    font-size: 9px;
    color: var(--color-text-tertiary);
    height: 11px;
    display: flex;
    align-items: center;
  }

  .hm-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .hm-cell {
    width: 11px;
    height: 11px;
    border-radius: 2px;
    cursor: default;
    position: relative;
  }

  .hm-cell:hover {
    outline: 1.5px solid var(--color-border-secondary);
  }

  .lv0 { background: #ebedf0; }
  .lv1 { background: #9be9a8; }
  .lv2 { background: #40c463; }
  .lv3 { background: #30a14e; }
  .lv4 { background: #216e39; }

  .hm-legend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
  }

  .hm-leg-label {
    font-size: 10px;
    color: var(--color-text-tertiary);
  }

  .hm-leg-cells {
    display: flex;
    gap: 2px;
  }

  .hm-leg-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .status-card {
    background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 16px;
  }

  .status-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 12px;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .status-row:last-child {
    margin-bottom: 0;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-name {
    font-size: 12px;
    color: var(--color-text-secondary);
    min-width: 70px;
  }

  .status-track {
    flex: 1;
    height: 3px;
    background: var(--color-background-secondary);
    border-radius: 2px;
    overflow: hidden;
  }

  .status-fill {
    height: 100%;
    border-radius: 2px;
  }

  .status-count {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
    min-width: 20px;
    text-align: right;
  }

  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .dash {
      padding: 12px;
    }
    
    .stat-value {
      font-size: 22px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .card,
    .heatmap-card,
    .status-card {
      padding: 12px;
    }

    .hm-cell {
      width: 9px;
      height: 9px;
    }
  }
</style>