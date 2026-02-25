import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import axios from 'axios';
import CaseModal from '../components/CaseModal';
import CaseDetailModal from '../components/CaseDetailModal';
import { exportCaseToPDF, exportCasesListToPDF } from '../utils/caseExport';
import './Cases.css';

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [typeFilter, setTypeFilter] = useState('All Types');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = () => {
        axios.get('http://localhost:5000/api/cases')
            .then(res => setCases(res.data))
            .catch(err => console.error(err));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this case?')) {
            axios.delete(`http://localhost:5000/api/cases/${id}`)
                .then(() => fetchCases())
                .catch(err => console.error(err));
        }
    };

    const handleEdit = (e, c) => {
        e.stopPropagation();
        setEditingCase(c);
        setIsModalOpen(true);
    };

    const handleView = (e, c) => {
        e.stopPropagation();
        setSelectedCase(c);
        setIsDetailOpen(true);
    };

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

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-urgent';
            case 'High': return 'text-high';
            case 'Medium': return 'text-medium';
            case 'Low': return 'text-low';
            default: return '';
        }
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.caseNumber.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || c.status === statusFilter;
        const matchesType = typeFilter === 'All Types' || c.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="cases-container">
            <header className="page-header-flex">
                <div>
                    <h1>Cases</h1>
                    <p>{cases.length} total cases</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline" onClick={() => exportCasesListToPDF(filteredCases)}>
                        <Download size={18} />
                        Export List
                    </button>
                    <button className="btn btn-primary" onClick={() => { setEditingCase(null); setIsModalOpen(true); }}>
                        <Plus size={18} />
                        New Case
                    </button>
                </div>
            </header>

            <div className="filters-bar card">
                <div className="search-input">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="select-filters">
                    <div className="select-wrapper">
                        <Filter size={16} className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option>All Statuses</option>
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Pending Review</option>
                            <option>Closed</option>
                            <option>On Hold</option>
                        </select>
                    </div>
                    <div className="select-wrapper">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option>All Types</option>
                            <option>Criminal</option>
                            <option>Corporate</option>
                            <option>Family</option>
                            <option>Real Estate</option>
                            <option>IP</option>
                            <option>Labor</option>
                            <option>Immigration</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Case #</th>
                            <th>Title</th>
                            <th>Client</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Filed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCases.map((c) => (
                            <tr key={c._id} onClick={() => { setSelectedCase(c); setIsDetailOpen(true); }} className="clickable-row">
                                <td><span className="case-num">{c.caseNumber}</span></td>
                                <td><span className="case-title">{c.title}</span></td>
                                <td><span className="client-name">{c.client?.name}</span></td>
                                <td>{c.type}</td>
                                <td>
                                    <span className={`badge ${getStatusClass(c.status)}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`priority-text ${getPriorityClass(c.priority)}`}>
                                        {c.priority}
                                    </span>
                                </td>
                                <td>{new Date(c.filingDate).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn view" onClick={(e) => handleView(e, c)} title="View Details"><Eye size={16} /></button>
                                        <button className="action-btn export" onClick={(e) => { e.stopPropagation(); exportCaseToPDF(c); }} title="Export PDF">
                                            <Download size={16} />
                                        </button>
                                        <button className="action-btn edit" onClick={(e) => handleEdit(e, c)} title="Edit Case">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete" onClick={(e) => handleDelete(e, c._id)} title="Delete Case">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <CaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchCases={fetchCases}
                    editingCase={editingCase}
                />
            )}

            {isDetailOpen && (
                <CaseDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    caseData={selectedCase}
                    onUpdate={fetchCases}
                />
            )}
        </div>
    );
};

export default Cases;
