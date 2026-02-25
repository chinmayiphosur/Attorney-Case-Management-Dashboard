import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, LogOut, Gavel, Calendar as CalendarIcon, Bell, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Layout.css';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
            setUser({});
        }
    }, []);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cases');
                const cases = res.data;
                const today = new Date();
                const upcoming = cases.filter(c => {
                    if (!c.hearingDate) return false;
                    const d = new Date(c.hearingDate);
                    const diff = d - today;
                    return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); // within 7 days
                }).map(c => ({
                    id: c._id,
                    title: 'Upcoming Hearing',
                    message: `${c.title} on ${new Date(c.hearingDate).toLocaleDateString()}`,
                    type: 'hearing'
                }));
                setNotifications(upcoming);
            } catch (err) {
                console.error('Failed to fetch notifications', err);
            }
        };
        fetchNotifications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Calendar', icon: <CalendarIcon size={20} />, path: '/calendar' },
        { name: 'Cases', icon: <Briefcase size={20} />, path: '/cases' },
        { name: 'Kanban', icon: <LayoutDashboard size={20} />, path: '/kanban' },
        { name: 'Clients', icon: <Users size={20} />, path: '/clients' },
    ];

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="logo-container">
                    <div className="logo-icon">
                        <Gavel color="#d97706" size={24} />
                    </div>
                    <div className="logo-text">
                        <h1>Attorney</h1>
                        <span>DASHBOARD</span>
                    </div>
                </div>

                <div className="notification-center">
                    <button
                        className={`notification-trigger ${notifications.length > 0 ? 'has-badge' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
                        <span>Notifications</span>
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="dropdown-header">
                                <h3>Alerts</h3>
                                <button onClick={() => setShowNotifications(false)}><X size={14} /></button>
                            </div>
                            <div className="dropdown-body">
                                {notifications.length === 0 ? (
                                    <div className="empty-state">No new notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="notification-item">
                                            <AlertCircle size={16} className="item-icon" />
                                            <div className="item-content">
                                                <p className="item-title">{n.title}</p>
                                                <p className="item-msg">{n.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <div className="user-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user.name || 'Attorney'}</span>
                        <span className="user-role">{user.specialization || 'Legal Specialist'}</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <button className="sign-out" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
