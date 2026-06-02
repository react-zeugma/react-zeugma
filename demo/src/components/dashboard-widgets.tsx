import { useState } from 'react';

// ==========================================================================
// 1. Trend Chart Widget (Responsive SVG Area/Line Chart)
// ==========================================================================
export function TrendChartWidget() {
  const data = [30, 45, 35, 70, 48, 85, 65, 95, 80];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  // Chart dimensions
  const width = 500;
  const height = 200;
  const padding = 30;

  // Coordinate helpers
  const getX = (index: number) => padding + (index * (width - padding * 2)) / (data.length - 1);
  const getY = (val: number) => height - padding - (val * (height - padding * 2)) / 100;

  // Build the line path
  const linePath = data.reduce((path, val, idx) => {
    return path + `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`;
  }, '');

  // Build the fill path under the line
  const fillPath = `${linePath} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

  return (
    <div className="widget-card widget-chart">
      <div className="widget-header">
        <div>
          <h4>Analytics Trend</h4>
          <span className="widget-subtitle">Traffic conversion & visitor growth</span>
        </div>
        <div className="widget-badge badge-success">+24.5%</div>
      </div>
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 25, 50, 75, 100].map((gridVal) => (
            <line
              key={gridVal}
              x1={padding}
              y1={getY(gridVal)}
              x2={width - padding}
              y2={getY(gridVal)}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area Fill */}
          <path d={fillPath} fill="url(#chartGrad)" />

          {/* Line Stroke */}
          <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points */}
          {data.map((val, idx) => (
            <g key={idx} className="chart-point-group">
              <circle
                cx={getX(idx)}
                cy={getY(val)}
                r="5"
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />
              <circle
                cx={getX(idx)}
                cy={getY(val)}
                r="10"
                fill="#4f46e5"
                fillOpacity="0"
                className="chart-point-hover"
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {labels.map((lbl, idx) => (
            <text
              key={lbl}
              x={getX(idx)}
              y={height - 8}
              textAnchor="middle"
              className="chart-axis-text"
            >
              {lbl}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ==========================================================================
// 2. Bar Chart Widget (Responsive SVG Bar Chart)
// ==========================================================================
export function BarChartWidget() {
  const data = [65, 85, 45, 95, 75, 100, 80, 50, 90, 60, 70, 85];
  const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = (chartWidth / data.length) * 0.7;
  const gap = (chartWidth / data.length) * 0.3;

  return (
    <div className="widget-card widget-chart">
      <div className="widget-header">
        <div>
          <h4>Monthly Revenue</h4>
          <span className="widget-subtitle">Gross sales in thousand USD</span>
        </div>
        <h3 className="widget-total">$428K</h3>
      </div>
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          {/* Horizontal Gridlines */}
          {[0, 25, 50, 75, 100].map((gridVal) => (
            <line
              key={gridVal}
              x1={padding}
              y1={height - padding - (gridVal * chartHeight) / 100}
              x2={width - padding}
              y2={height - padding - (gridVal * chartHeight) / 100}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {data.map((val, idx) => {
            const barHeight = (val * chartHeight) / 100;
            const x = padding + idx * (barWidth + gap) + gap / 2;
            const y = height - padding - barHeight;

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="#3b82f6"
                className="chart-bar-rect"
              />
            );
          })}

          {/* Axis Labels */}
          {labels.map((lbl, idx) => {
            const x = padding + idx * (barWidth + gap) + gap / 2 + barWidth / 2;
            return (
              <text key={idx} x={x} y={height - 8} textAnchor="middle" className="chart-axis-text">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ==========================================================================
// 3. User Management Table Widget
// ==========================================================================
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'offline';
  activity: string;
}

export function TableWidget() {
  const [search, setSearch] = useState('');

  const users: User[] = [
    {
      id: 1,
      name: 'Yusuf Arslan',
      email: 'yusuf@zeugma.dev',
      role: 'Owner',
      status: 'active',
      activity: 'Just now',
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.d@example.com',
      role: 'Editor',
      status: 'active',
      activity: '10m ago',
    },
    {
      id: 3,
      name: 'John Smith',
      email: 'smith.j@example.com',
      role: 'Viewer',
      status: 'suspended',
      activity: '2d ago',
    },
    {
      id: 4,
      name: 'Alice Cooper',
      email: 'alice.c@example.com',
      role: 'Viewer',
      status: 'offline',
      activity: '5d ago',
    },
    {
      id: 5,
      name: 'Robert Martin',
      email: 'robert@clean.code',
      role: 'Contributor',
      status: 'active',
      activity: '1h ago',
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="widget-card widget-table">
      <div className="widget-header table-actions-header">
        <div>
          <h4>User Directory</h4>
          <span className="widget-subtitle">Manage organization collaborators</span>
        </div>
        <div className="table-search-input-wrapper">
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search-input"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="widget-data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>{user.status}</span>
                  </td>
                  <td>{user.activity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="table-empty-row">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================================================
// 4. Performance Metrics Widget (SVG Progress Circles)
// ==========================================================================
export function PerformanceWidget() {
  const metrics = [
    { label: 'CPU Load', value: 78, color: '#ef4444' },
    { label: 'Memory', value: 64, color: '#3b82f6' },
    { label: 'Disk Space', value: 42, color: '#10b981' },
  ];

  // Circle path helper
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius; // ~150.8

  return (
    <div className="widget-card widget-performance">
      <div className="widget-header">
        <div>
          <h4>System Performance</h4>
          <span className="widget-subtitle">Live server instance metrics</span>
        </div>
        <div className="pulse-indicator">
          <span className="pulse-dot"></span>
          Live
        </div>
      </div>

      <div className="performance-gauges">
        {metrics.map((m) => {
          const strokeOffset = circumference - (m.value / 100) * circumference;
          return (
            <div key={m.label} className="gauge-item">
              <div className="gauge-svg-wrapper">
                <svg width="70" height="70" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke={m.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <span className="gauge-value">{m.value}%</span>
              </div>
              <span className="gauge-label">{m.label}</span>
            </div>
          );
        })}
      </div>

      <div className="system-stats-list">
        <div className="system-stat-row">
          <span>Active Connections</span>
          <strong>1,492 / s</strong>
        </div>
        <div className="system-stat-row">
          <span>API Latency</span>
          <strong>42 ms</strong>
        </div>
        <div className="system-stat-row">
          <span>Errors</span>
          <strong style={{ color: '#ef4444' }}>0.02%</strong>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 5. Default Guide / State Widget
// ==========================================================================
export function DefaultGuideWidget({ paneId }: { paneId: string }) {
  return (
    <div className="widget-card widget-guide">
      <div className="guide-content">
        <div className="guide-icon">⚡</div>
        <h3>Interactive Pane: {paneId.toUpperCase()}</h3>
        <p>
          Use the selector dropdown in the header to populate this panel with actual analytics
          charts, user grids, or metrics gauges.
        </p>

        <div className="tip-box">
          <strong>Pro-Tip:</strong> Grab the panel header to drag-and-drop. Drop on
          left/right/top/bottom to split this pane. Drag resizer bars to scale widgets.
        </div>
      </div>
    </div>
  );
}
