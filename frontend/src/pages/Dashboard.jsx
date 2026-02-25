import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, AlertTriangle, Users, Calendar, Scale } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Your case management overview at a glance</p>
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

      {upcomingHearings.length > 0 && (
        <div className="card upcoming-hearings">
          <div className="card-header">
            <h2><Calendar size={18} style={{ marginRight: '8px' }} /> Upcoming Hearings</h2>
          </div>
          <div className="hearings-grid">
            {upcomingHearings.map(h => (
              <div key={h._id} className="hearing-card" onClick={() => showDetail(h)}>
                <div className="hearing-date">
                  <span className="day">{new Date(h.hearingDate).getDate()}</span>
                  <span className="month">{new Date(h.hearingDate).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="hearing-info">
                  <h4>{h.title}</h4>
                  <p>{h.court}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="content-grid">
        <div className="card main-card recent-cases-card">
          <div className="card-header">
            <h2>Recent Cases</h2>
            <button className="text-btn" onClick={() => navigate('/cases')}>View all →</button>
          </div>
          <div className="case-list">
            {recentCases.map((c) => (
              <div key={c._id} className="case-item clickable" onClick={() => showDetail(c)}>
                <div className="case-info">
                  <h3>{c.title}</h3>
                  <div className="case-meta">
                    <span>{c.caseNumber}</span>
                    <span>•</span>
                    <span>{c.client?.name}</span>
                  </div>
                </div>
                <div className={`badge ${getStatusClass(c.status)}`}>
                  {c.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card main-card chart-card">
          <div className="card-header">
            <h2>Cases by Type</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card main-card chart-card">
          <div className="card-header">
            <h2>Case Resolution</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
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
