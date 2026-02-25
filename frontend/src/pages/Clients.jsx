import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import ClientModal from '../components/ClientModal';
import ClientDetailModal from '../components/ClientDetailModal';
import './Clients.css';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = () => {
        axios.get('http://localhost:5000/api/clients')
            .then(res => setClients(res.data))
            .catch(err => console.error(err));
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this client?')) {
            axios.delete(`http://localhost:5000/api/clients/${id}`)
                .then(() => fetchClients())
                .catch(err => console.error(err));
        }
    };

    const handleEdit = (e, c) => {
        e.stopPropagation();
        setEditingClient(c);
        setIsModalOpen(true);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="clients-container">
            <header className="page-header-flex">
                <div>
                    <h1>Clients</h1>
                    <p>{clients.length} total clients</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingClient(null); setIsModalOpen(true); }}>
                    <Plus size={18} />
                    Add Client
                </button>
            </header>

            <div className="filters-bar card">
                <div className="search-input">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Cases</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((c) => (
                            <tr key={c._id} onClick={() => { setSelectedClient(c); setIsDetailOpen(true); }} className="clickable-row">
                                <td>
                                    <div className="client-avatar-name">
                                        <div className="avatar">
                                            {c.name.charAt(0)}
                                        </div>
                                        <span className="client-name-bold">{c.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div className="contact-item">
                                            <Mail size={12} /> {c.email}
                                        </div>
                                        <div className="contact-item">
                                            <Phone size={12} /> {c.phone}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="address-info">
                                        <MapPin size={12} className="icon-muted" />
                                        <span>{c.address}</span>
                                    </div>
                                </td>
                                <td><span className="case-count">1 cases</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn" onClick={(e) => handleEdit(e, c)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete" onClick={(e) => handleDelete(e, c._id)}>
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
                <ClientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchClients={fetchClients}
                    editingClient={editingClient}
                />
            )}

            {isDetailOpen && (
                <ClientDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    clientData={selectedClient}
                />
            )}
        </div>
    );
};

export default Clients;
