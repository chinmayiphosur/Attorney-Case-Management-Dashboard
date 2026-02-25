import React from 'react';
import { X, User, Mail, Phone, MapPin, FileText, Briefcase } from 'lucide-react';
import './Modal.css';

const ClientDetailModal = ({ isOpen, onClose, clientData }) => {
    if (!isOpen || !clientData) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container detail-modal">
                <div className="modal-header">
                    <div className="client-header-info">
                        <div className="avatar large">
                            {clientData.name.charAt(0)}
                        </div>
                        <div>
                            <h2>{clientData.name}</h2>
                            <span className="client-subtitle">Client since {new Date(clientData.createdAt).getFullYear()}</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <div className="detail-grid">
                        <div className="detail-section">
                            <h3><Mail size={16} /> Contact Information</h3>
                            <div className="info-row">
                                <span className="label">Email</span>
                                <span className="value">{clientData.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Phone</span>
                                <span className="value">{clientData.phone || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3><MapPin size={16} /> Address</h3>
                            <p className="address-text">{clientData.address || 'No address provided.'}</p>
                        </div>
                    </div>

                    <div className="detail-full-width">
                        <h3><FileText size={16} /> Client Notes</h3>
                        <div className="notes-box">
                            {clientData.notes || 'No notes for this client.'}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailModal;
