import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, User, Calendar, ChevronRight, ChevronLeft, MoreVertical } from 'lucide-react';
import CaseDetailModal from '../components/CaseDetailModal';
import './Kanban.css';

const Kanban = () => {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const statuses = ['Open', 'In Progress', 'Pending Review', 'Closed'];

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cases');
            setCases(res.data);
        } catch (err) {
            console.error('Error fetching cases:', err);
        }
    };

    const updateCaseStatus = async (caseId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/cases/${caseId}`, { status: newStatus });
            fetchCases();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getCasesByStatus = (status) => {
        return cases.filter(c => c.status === status);
    };

    const showDetail = (c) => {
        setSelectedCase(c);
        setIsDetailOpen(true);
    };

    return (
        <div className="kanban-container">
            <header className="page-header">
                <h1>Case Workflow</h1>
                <p>Track your cases through the legal process</p>
            </header>

            <div className="kanban-board">
                {statuses.map(status => (
                    <div key={status} className="kanban-column">
                        <div className="column-header">
                            <h2>{status}</h2>
                            <span className="count">{getCasesByStatus(status).length}</span>
                        </div>
                        <div className="column-content">
                            {getCasesByStatus(status).map(item => (
                                <div key={item._id} className="kanban-card" onClick={() => showDetail(item)}>
                                    <div className="card-priority-indicator" data-priority={item.priority}></div>
                                    <div className="card-header">
                                        <span className="case-number">{item.caseNumber}</span>
                                        <button className="card-menu-btn" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <div className="card-footer">
                                        <div className="card-client">
                                            <User size={12} />
                                            <span>{item.client?.name}</span>
                                        </div>
                                        <div className="card-actions">
                                            {status !== 'Open' && (
                                                <button
                                                    className="move-btn"
                                                    onClick={(e) => { e.stopPropagation(); updateCaseStatus(item._id, statuses[statuses.indexOf(status) - 1]); }}
                                                    title="Move back"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                            )}
                                            {status !== 'Closed' && (
                                                <button
                                                    className="move-btn"
                                                    onClick={(e) => { e.stopPropagation(); updateCaseStatus(item._id, statuses[statuses.indexOf(status) + 1]); }}
                                                    title="Move forward"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <CaseDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                caseData={selectedCase}
                onUpdate={fetchCases}
            />
        </div>
    );
};

export default Kanban;
