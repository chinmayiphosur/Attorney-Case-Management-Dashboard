import React, { useState } from 'react';
import { X, Calendar, MapPin, User, FileText, Scale, Briefcase, Download, Upload, Trash2, File } from 'lucide-react';
import axios from 'axios';
import { exportCaseToPDF } from '../utils/caseExport';
import './Modal.css';

const CaseDetailModal = ({ isOpen, onClose, caseData, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [uploading, setUploading] = useState(false);

    if (!isOpen || !caseData) return null;

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isNearDeadline = (date) => {
        if (!date) return false;
        const d = new Date(date);
        const today = new Date();
        const diff = d - today;
        const days = diff / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 7;
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

    return (
        <div className="modal-overlay">
            <div className="modal-container detail-modal">
                <div className="modal-header">
                    <div>
                        <span className="case-id">{caseData.caseNumber}</span>
                        <h2>{caseData.title}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        Documents ({caseData.documents?.length || 0})
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'overview' ? (
                        <>
                            <div className="detail-grid">
                                <div className="detail-section">
                                    <h3><Scale size={16} /> Case Information</h3>
                                    <div className="info-row">
                                        <span className="label">Type</span>
                                        <span className="value">{caseData.type}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Status</span>
                                        <span className={`badge ${getStatusClass(caseData.status)}`}>{caseData.status}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Priority</span>
                                        <span className="value">{caseData.priority}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3><User size={16} /> Client Details</h3>
                                    <div className="info-row">
                                        <span className="label">Name</span>
                                        <span className="value">{caseData.client?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Contact</span>
                                        <span className="value">{caseData.client?.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3><Calendar size={16} /> Important Dates</h3>
                                    <div className="info-row">
                                        <span className="label">Filing Date</span>
                                        <span className={`value ${isNearDeadline(caseData.filingDate) ? 'deadline-near' : ''}`}>{formatDate(caseData.filingDate)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Hearing Date</span>
                                        <span className={`value highlight ${isNearDeadline(caseData.hearingDate) ? 'deadline-near' : ''}`}>{formatDate(caseData.hearingDate)}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3><MapPin size={16} /> Court Details</h3>
                                    <div className="info-row">
                                        <span className="label">Court</span>
                                        <span className="value">{caseData.court || 'Not specified'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Judge</span>
                                        <span className="value">{caseData.judge || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Opposing Counsel</span>
                                        <span className="value">{caseData.opposingCounsel || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-full-width">
                                <h3><FileText size={16} /> Description</h3>
                                <p className="description-text">{caseData.description || 'No description provided.'}</p>
                            </div>

                            <div className="detail-full-width">
                                <h3><Scale size={16} /> Case Checklist</h3>
                                <div className="checklist-container">
                                    {(caseData.checklists || []).map((item, idx) => (
                                        <div key={idx} className="checklist-item">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={async () => {
                                                    const updatedChecklist = [...caseData.checklists];
                                                    updatedChecklist[idx].completed = !updatedChecklist[idx].completed;
                                                    try {
                                                        await axios.put(`http://localhost:5000/api/cases/${caseData._id}`, { checklists: updatedChecklist });
                                                        if (onUpdate) onUpdate();
                                                    } catch (err) {
                                                        console.error('Checklist update failed', err);
                                                    }
                                                }}
                                            />
                                            <span className={item.completed ? 'completed' : ''}>{item.task}</span>
                                        </div>
                                    ))}
                                    <div className="add-task">
                                        <input
                                            type="text"
                                            placeholder="Add new task..."
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                    const newTask = { task: e.target.value.trim(), completed: false };
                                                    const updatedChecklist = [...(caseData.checklists || []), newTask];
                                                    try {
                                                        await axios.put(`http://localhost:5000/api/cases/${caseData._id}`, { checklists: updatedChecklist });
                                                        e.target.value = '';
                                                        if (onUpdate) onUpdate();
                                                    } catch (err) {
                                                        console.error('Add task failed', err);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="detail-full-width">
                                <h3><Briefcase size={16} /> Internal Notes</h3>
                                <div className="notes-box">
                                    {caseData.internalNotes || 'No internal notes.'}
                                </div>
                            </div>

                            {caseData.status !== 'Closed' && (
                                <div className="detail-full-width close-case-section">
                                    <h3>Close Case</h3>
                                    <div className="resolution-picker">
                                        <p>Record the final outcome to close this case:</p>
                                        <div className="btn-group">
                                            {['Won', 'Lost', 'Settled', 'Dismissed'].map(res => (
                                                <button
                                                    key={res}
                                                    className={`btn btn-outcome ${res.toLowerCase()}`}
                                                    onClick={async () => {
                                                        if (window.confirm(`Close case as ${res}?`)) {
                                                            try {
                                                                await axios.put(`http://localhost:5000/api/cases/${caseData._id}`, {
                                                                    status: 'Closed',
                                                                    resolution: res,
                                                                    closingDate: new Date()
                                                                });
                                                                if (onUpdate) onUpdate();
                                                                setActiveTab('overview');
                                                            } catch (err) {
                                                                console.error('Closing case failed', err);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {res}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {caseData.status === 'Closed' && (
                                <div className="detail-full-width closed-summary">
                                    <div className="summary-box">
                                        <div className="summary-item">
                                            <span className="label">Resolution</span>
                                            <span className={`value outcome-${caseData.resolution?.toLowerCase()}`}>{caseData.resolution}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span className="label">Closed On</span>
                                            <span className="value">{formatDate(caseData.closingDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="documents-tab">
                            <div className="doc-header">
                                <h3>Case Documents</h3>
                                <div className="upload-wrapper">
                                    <input
                                        type="file"
                                        id="doc-upload"
                                        hidden
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setUploading(true);
                                            const formData = new FormData();
                                            formData.append('file', file);

                                            try {
                                                await axios.post(`http://localhost:5000/api/documents/${caseData._id}`, formData);
                                                if (onUpdate) onUpdate();
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                                alert('Upload failed');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                    />
                                    <label htmlFor="doc-upload" className={`btn btn-upload ${uploading ? 'disabled' : ''}`}>
                                        <Upload size={16} />
                                        {uploading ? 'Uploading...' : 'Upload Document'}
                                    </label>
                                </div>
                            </div>

                            <div className="doc-list">
                                {(!caseData.documents || caseData.documents.length === 0) ? (
                                    <div className="no-docs">
                                        <File size={40} />
                                        <p>No documents uploaded yet</p>
                                    </div>
                                ) : (
                                    caseData.documents.map(doc => (
                                        <div key={doc._id} className="doc-item">
                                            <div className="doc-info">
                                                <FileText className="doc-icon" size={24} />
                                                <div className="doc-meta">
                                                    <span className="doc-name">{doc.name}</span>
                                                    <span className="doc-details">
                                                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="doc-actions">
                                                <a
                                                    href={`http://localhost:5000${doc.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-btn download"
                                                    title="Download"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <button
                                                    className="action-btn delete"
                                                    title="Delete"
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this document?')) {
                                                            try {
                                                                await axios.delete(`http://localhost:5000/api/documents/${caseData._id}/${doc._id}`);
                                                                if (onUpdate) onUpdate();
                                                            } catch (err) {
                                                                console.error('Delete failed', err);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-export" onClick={() => exportCaseToPDF(caseData)}>
                        <Download size={18} />
                        Export Case PDF
                    </button>
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default CaseDetailModal;
