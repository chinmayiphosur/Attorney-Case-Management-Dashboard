import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Clock, AlertTriangle, Users, Calendar, Scale, Search, FileText, CheckCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import CaseDetailModal from '../components/CaseDetailModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    highPriority: 0,
    totalClients: 0,
    winRate: 0,
    avgCompletion: 0
  });

  const [recentCases, setRecentCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [caseByType, setCaseByType] = useState([
    { name: 'Criminal', value: 0, color: '#3b82f6' },
    { name: 'Corporate', value: 0, color: '#f59e0b' },
    { name: 'Family', value: 0, color: '#10b981' },
    { name: 'Real Estate', value: 0, color: '#ef4444' },
    { name: 'IP', value: 0, color: '#8b5cf6' },
    { name: 'Labor', value: 0, color: '#ec4899' },
    { name: 'Immigration', value: 0, color: '#06b6d4' },
  ]);

  const [resolutionData, setResolutionData] = useState([
    { name: 'Won', value: 0, color: '#10b981' },
    { name: 'Lost', value: 0, color: '#ef4444' },
    { name: 'Settled', value: 0, color: '#3b82f6' },
    { name: 'Other', value: 0, color: '#64748b' }
  ]);

  const [selectedCase, setSelectedCase] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ cases: [], clients: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // New Analytics States
  const [docStatusData, setDocStatusData] = useState([
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Reviewed', value: 0, color: '#3b82f6' },
    { name: 'Approved', value: 0, color: '#10b981' }
  ]);
  const [casesPerClient, setCasesPerClient] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchStats = async () => {
    try {
      const [casesRes, clientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/cases'),
        axios.get('http://localhost:5000/api/clients')
      ]);

      const cases = casesRes.data;
      const clients = clientsRes.data;

      setRecentCases(cases.slice(0, 4));

      // Find upcoming hearings (sorted by date)
      const hearings = cases
        .filter(c => c.hearingDate && new Date(c.hearingDate) > new Date())
        .sort((a, b) => new Date(a.hearingDate) - new Date(b.hearingDate))
        .slice(0, 3);
      setUpcomingHearings(hearings);

      // Calculate Win Rate and Duration
      const resolvedCases = cases.filter(c => c.status === 'Closed' && c.resolution);
      const wonCases = resolvedCases.filter(c => c.resolution === 'Won').length;
      const winRate = resolvedCases.length > 0 ? Math.round((wonCases / resolvedCases.length) * 100) : 0;

      const durations = resolvedCases
        .filter(c => c.closingDate && c.filingDate)
        .map(c => (new Date(c.closingDate) - new Date(c.filingDate)) / (1000 * 60 * 60 * 24));
      const avgCompletion = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

      setStats({
        totalCases: cases.length,
        activeCases: cases.filter(c => ['Open', 'In Progress'].includes(c.status)).length,
        highPriority: cases.filter(c => ['High', 'Urgent'].includes(c.priority)).length,
        totalClients: clients.length,
        winRate,
        avgCompletion
      });

      // Update resolution chart
      const resCounts = cases.reduce((acc, c) => {
        if (c.status === 'Closed' && c.resolution) {
          acc[c.resolution] = (acc[c.resolution] || 0) + 1;
        }
        return acc;
      }, {});

      setResolutionData([
        { name: 'Won', value: resCounts['Won'] || 0, color: '#10b981' },
        { name: 'Lost', value: resCounts['Lost'] || 0, color: '#ef4444' },
        { name: 'Settled', value: resCounts['Settled'] || 0, color: '#3b82f6' },
        { name: 'Other', value: (resCounts['Dismissed'] || 0) + (resCounts['Dropped'] || 0), color: '#64748b' }
      ]);

      // Update chart data
      const typeCounts = cases.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {});

      const updatedChart = caseByType.map(cat => ({
        ...cat,
        value: typeCounts[cat.name] || 0
      }));
      setCaseByType(updatedChart);

      // Aggregate Document Statuses
      const docCounts = cases.reduce((acc, c) => {
        (c.documents || []).forEach(doc => {
          const status = doc.status || 'Pending';
          acc[status] = (acc[status] || 0) + 1;
        });
        return acc;
      }, {});

      setDocStatusData([
        { name: 'Pending', value: docCounts['Pending'] || 0, color: '#f59e0b' },
        { name: 'Reviewed', value: docCounts['Reviewed'] || 0, color: '#3b82f6' },
        { name: 'Approved', value: docCounts['Approved'] || 0, color: '#10b981' }
      ]);

      // Cases per Client (Bar Chart)
      const clientCaseCounts = cases.reduce((acc, c) => {
        const clientName = c.client?.name || 'Unknown';
        acc[clientName] = (acc[clientName] || 0) + 1;
        return acc;
      }, {});

      const barData = Object.entries(clientCaseCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // top 5 clients
      setCasesPerClient(barData);

      // Tasks Aggregation
      const allTasks = cases.reduce((acc, c) => {
        (c.checklists || []).forEach(task => {
          acc.push({
            ...task,
            caseId: c._id,
            caseTitle: c.title,
            priority: c.priority,
            deadline: c.hearingDate // using hearingDate as a proxy for deadline if no task date
          });
        });
        return acc;
      }, []);
      setTasks(allTasks.sort((a, b) => a.completed - b.completed).slice(0, 5));

    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/search?q=${searchTerm}`);
          setSearchResults(data);
          setShowResults(true);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults({ cases: [], clients: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const statCards = [
    { title: 'Total Cases', value: stats.totalCases, icon: <Briefcase className="stat-icon-blue" />, sub: '' },
    { title: 'Win Rate', value: `${stats.winRate}%`, icon: <Scale className="stat-icon-green" />, sub: 'Cases won' },
    { title: 'High Priority', value: stats.highPriority, icon: <AlertTriangle className="stat-icon-red" />, sub: 'Urgent & High' },
    { title: 'Avg Duration', value: `${stats.avgCompletion}d`, icon: <Clock className="stat-icon-yellow" />, sub: 'To resolution' },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Progress': return 'badge-progress';
      case 'Open': return 'badge-open';
      case 'Pending Review': return 'badge-pending';
      case 'Closed': return 'badge-closed';
      case 'On Hold': return 'badge-hold';
      default: return '';
    }
  };

  const showDetail = (c) => {
    setSelectedCase(c);
    setIsDetailOpen(true);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>

        <div className="dashboard-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search cases, clients, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length > 1 && setShowResults(true)}
            />
          </div>

          {showResults && (searchTerm.length > 1) && (
            <div className="search-results-dropdown">
              {searchResults.cases.length === 0 && searchResults.clients.length === 0 ? (
                <div className="no-results">No matches found</div>
              ) : (
                <>
                  {searchResults.cases.length > 0 && (
                    <div className="result-group">
                      <div className="group-label">CASES</div>
                      {searchResults.cases.map(c => (
                        <div key={c._id} className="result-item" onClick={() => { navigate('/cases'); setShowResults(false); setSearchTerm(''); }}>
                          <FileText size={16} />
                          <div className="item-text">
                            <span className="item-title">{c.title}</span>
                            <span className="item-sub">{c.caseNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.clients.length > 0 && (
                    <div className="result-group">
                      <div className="group-label">CLIENTS</div>
                      {searchResults.clients.map(c => (
                        <div key={c._id} className="result-item" onClick={() => { navigate('/clients'); setShowResults(false); setSearchTerm(''); }}>
                          <Users size={16} />
                          <div className="item-text">
                            <span className="item-title">{c.name}</span>
                            <span className="item-sub">{c.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-content">
              <span className="stat-title">{card.title}</span>
              <span className="stat-value">{card.value}</span>
              <span className="stat-sub">{card.sub}</span>
            </div>
            <div className="stat-icon-container">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-flow">
        {upcomingHearings.length > 0 && (
          <div className="card upcoming-hearings-horizontal">
            <div className="card-header">
              <h2><Calendar size={18} /> Upcoming Hearings</h2>
              <button className="text-btn" onClick={() => navigate('/calendar')}>View Schedule</button>
            </div>
            <div className="hearings-grid-scroll">
              {upcomingHearings.map(h => (
                <div key={h._id} className="hearing-card-flat" onClick={() => showDetail(h)}>
                  <div className="h-date-badge">
                    <span className="h-day">{new Date(h.hearingDate).getDate()}</span>
                    <span className="h-month">{new Date(h.hearingDate).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="h-details">
                    <strong>{h.title}</strong>
                    <p>{h.court}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-main-grid">
          <div className="card task-analysis-card">
            <div className="card-header">
              <h2><CheckCircle size={18} /> Legal Tasks & Deadlines</h2>
              <button className="text-btn" onClick={() => navigate('/kanban')}>Go to Kanban</button>
            </div>
            <div className="task-table-container">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Case</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, i) => (
                    <tr key={i}>
                      <td>{task.task}</td>
                      <td><span className="table-case-title">{task.caseTitle}</span></td>
                      <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}</td>
                      <td>
                        <div className="progress-mini">
                          <div
                            className={`progress-fill ${task.completed ? 'done' : ''}`}
                            style={{ width: task.completed ? '100%' : '30%' }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row">No active tasks found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card analytics-card">
            <div className="card-header">
              <h2>Document Status</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={docStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {docStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card recent-cases-card">
            <div className="card-header">
              <h2>Recent Active Cases</h2>
              <button className="text-btn" onClick={() => navigate('/cases')}>Explore All</button>
            </div>
            <div className="case-list-dashboard">
              {recentCases.map((c) => (
                <div key={c._id} className="case-entry" onClick={() => showDetail(c)}>
                  <div className="entry-main">
                    <h4>{c.title}</h4>
                    <p>{c.client?.name} • {c.caseNumber}</p>
                    <div className="entry-progress-container">
                      <div className="progress-label">
                        <span>Milestones</span>
                        <span>{Math.round(((c.checklists?.filter(ck => ck.completed).length || 0) / (c.checklists?.length || 1)) * 100)}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${((c.checklists?.filter(ck => ck.completed).length || 0) / (c.checklists?.length || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className={`badge ${getStatusClass(c.status)}`}>
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card analytics-card">
            <div className="card-header">
              <h2>Cases per Client</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={casesPerClient} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card analytics-card">
            <div className="card-header">
              <h2>Case Resolution</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card analytics-card">
            <div className="card-header">
              <h2>Case Distribution</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={caseByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {caseByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <CaseDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        caseData={selectedCase}
        onUpdate={fetchStats}
      />
    </div>
  );
};

export default Dashboard;
