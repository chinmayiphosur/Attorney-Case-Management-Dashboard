import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cases');
            const formattedEvents = res.data
                .filter(c => c.hearingDate)
                .map(c => ({
                    id: c._id,
                    title: `${c.caseNumber}: ${c.title}`,
                    start: c.hearingDate,
                    allDay: true,
                    extendedProps: {
                        priority: c.priority,
                        status: c.status,
                        client: c.client?.name
                    },
                    backgroundColor: getPriorityColor(c.priority),
                    borderColor: getPriorityColor(c.priority),
                }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching calendar data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#3b82f6';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    const handleEventClick = (info) => {
        const { title, extendedProps } = info.event;
        alert(`Hearing: ${title}\nClient: ${extendedProps.client}\nPriority: ${extendedProps.priority}\nStatus: ${extendedProps.status}`);
    };

    return (
        <div className="calendar-page">
            <header className="calendar-header">
                <div className="header-title">
                    <div className="title-icon">
                        <CalendarIcon size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <h1>Hearing Calendar</h1>
                        <p>Manage and track all upcoming court dates</p>
                    </div>
                </div>

                <div className="calendar-legend">
                    <div className="legend-item"><span className="dot urgent"></span> Urgent</div>
                    <div className="legend-item"><span className="dot high"></span> High</div>
                    <div className="legend-item"><span className="dot medium"></span> Medium</div>
                    <div className="legend-item"><span className="dot low"></span> Low</div>
                </div>
            </header>

            <div className="calendar-container card">
                {loading ? (
                    <div className="calendar-loader">
                        <div className="spinner"></div>
                        <p>Loading hearings...</p>
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        dayMaxEvents={true}
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Calendar;
