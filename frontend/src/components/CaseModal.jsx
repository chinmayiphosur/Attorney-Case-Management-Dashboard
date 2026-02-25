import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

const CaseModal = ({ isOpen, onClose, fetchCases, editingCase }) => {
    const [formData, setFormData] = useState({
        caseNumber: '',
        title: '',
        type: 'Civil',
        status: 'Open',
        priority: 'Medium',
        client: '',
        description: '',
        court: '',
        judge: '',
        opposingCounsel: '',
        filingDate: '',
        hearingDate: '',
        internalNotes: ''
    });

    const [clients, setClients] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/clients')
            .then(res => setClients(res.data))
            .catch(err => console.error(err));

        if (editingCase) {
            setFormData({
                ...editingCase,
                client: editingCase.client?._id || '',
                filingDate: editingCase.filingDate ? new Date(editingCase.filingDate).toISOString().split('T')[0] : '',
                hearingDate: editingCase.hearingDate ? new Date(editingCase.hearingDate).toISOString().split('T')[0] : ''
            });
        }
    }, [editingCase]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const apiCall = editingCase
            ? axios.put(`http://localhost:5000/api/cases/${editingCase._id}`, formData)
            : axios.post('http://localhost:5000/api/cases', formData);

        apiCall.then(() => {
            fetchCases();
            onClose();
        })
            .catch(err => console.error(err));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{editingCase ? 'Edit Case' : 'New Case'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Case Number *</label>
                            <input name="caseNumber" value={formData.caseNumber} onChange={handleChange} required placeholder="e.g. 2025-CV-001" />
                        </div>
                        <div className="form-group flex-2">
                            <label>Title *</label>
                            <input name="title" value={formData.title} onChange={handleChange} required placeholder="Case title" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Case Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option>Civil</option>
                                <option>Criminal</option>
                                <option>Corporate</option>
                                <option>Family</option>
                                <option>Real Estate</option>
                                <option>IP</option>
                                <option>Labor</option>
                                <option>Immigration</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Pending Review</option>
                                <option>Closed</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option>Urgent</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Client</label>
                        <select name="client" value={formData.client} onChange={handleChange} required>
                            <option value="">Select a client</option>
                            {clients.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Case description and details..." rows="3"></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Court</label>
                            <input name="court" value={formData.court} onChange={handleChange} placeholder="Court name" />
                        </div>
                        <div className="form-group">
                            <label>Judge</label>
                            <input name="judge" value={formData.judge} onChange={handleChange} placeholder="Judge name" />
                        </div>
                        <div className="form-group">
                            <label>Opposing Counsel</label>
                            <input name="opposingCounsel" value={formData.opposingCounsel} onChange={handleChange} placeholder="Opposing counsel" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Filing Date</label>
                            <input type="date" name="filingDate" value={formData.filingDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Next Hearing Date</label>
                            <input type="date" name="hearingDate" value={formData.hearingDate} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Internal Notes</label>
                        <textarea name="internalNotes" value={formData.internalNotes} onChange={handleChange} placeholder="Private notes..." rows="2"></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editingCase ? 'Update Case' : 'Create Case'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CaseModal;
