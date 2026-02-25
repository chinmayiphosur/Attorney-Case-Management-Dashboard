import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import './Modal.css';

const ClientModal = ({ isOpen, onClose, fetchClients, editingClient }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        if (editingClient) {
            setFormData(editingClient);
        }
    }, [editingClient]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const apiCall = editingClient
            ? axios.put(`http://localhost:5000/api/clients/${editingClient._id}`, formData)
            : axios.post('http://localhost:5000/api/clients', formData);

        apiCall.then(() => {
            fetchClients();
            onClose();
        })
            .catch(err => console.error(err));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '540px' }}>
                <div className="modal-header">
                    <h2>{editingClient ? 'Edit Client' : 'New Client'}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} required placeholder="Client's full name" />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                        </div>
                        <div className="form-group flex-1">
                            <label>Phone</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes..." rows="3"></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editingClient ? 'Update Client' : 'Add Client'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;
