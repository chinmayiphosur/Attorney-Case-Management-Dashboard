const mongoose = require('mongoose');
require('dotenv').config();
const Case = require('./models/Case');
const Client = require('./models/Client');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Case.deleteMany({});
        await Client.deleteMany({});

        // Create Clients
        const clients = await Client.insertMany([
            { name: 'Sarah Mitchell', email: 'sarah.mitchell@email.com', phone: '+1 (555) 123-4567', address: '450 Park Avenue, New York, NY 10022' },
            { name: 'James Rodriguez', email: 'j.rodriguez@lawfirm.com', phone: '+1 (555) 234-5678', address: '1200 Elm Street, Dallas, TX 75270' },
            { name: 'Emily Chen', email: 'emily.chen@corp.com', phone: '+1 (555) 345-6789', address: '88 Market Street, San Francisco, CA 94105' },
            { name: 'Robert Thompson', email: 'r.thompson@business.net', phone: '+1 (555) 456-7890', address: '200 Michigan Ave, Chicago, IL 60601' },
            { name: 'Amanda Foster', email: 'a.foster@email.com', phone: '+1 (555) 567-8901', address: '500 Boylston Street, Boston, MA 02116' },
        ]);

        // Create Cases
        const cases = [
            {
                caseNumber: '2025-CR-0042',
                title: 'State v. Marcus Wells',
                type: 'Criminal',
                status: 'In Progress',
                priority: 'High',
                client: clients[0]._id,
                filingDate: new Date('2025-03-15'),
            },
            {
                caseNumber: '2025-CV-1187',
                title: 'Mitchell Corp v. DataSync Inc.',
                type: 'Corporate',
                status: 'Open',
                priority: 'Urgent',
                client: clients[2]._id,
                filingDate: new Date('2025-06-20'),
            },
            {
                caseNumber: '2025-FL-0389',
                title: 'Rodriguez Custody Arrangement',
                type: 'Family',
                status: 'Pending Review',
                priority: 'Medium',
                client: clients[1]._id,
                filingDate: new Date('2025-08-01'),
            },
            {
                caseNumber: '2025-RE-0455',
                title: 'Thompson Property Dispute',
                type: 'Real Estate',
                status: 'In Progress',
                priority: 'Medium',
                client: clients[3]._id,
                filingDate: new Date('2025-04-10'),
            },
            {
                caseNumber: '2025-IP-0078',
                title: 'Foster Patent Infringement',
                type: 'IP',
                status: 'Open',
                priority: 'High',
                client: clients[4]._id,
                filingDate: new Date('2025-09-22'),
            },
            {
                caseNumber: '2024-LB-0821',
                title: 'Chen Wrongful Termination',
                type: 'Labor',
                status: 'Closed',
                priority: 'Low',
                client: clients[2]._id,
                filingDate: new Date('2024-11-15'),
            },
            {
                caseNumber: '2025-IM-0156',
                title: 'Rodriguez Immigration Appeal',
                type: 'Immigration',
                status: 'On Hold',
                priority: 'Medium',
                client: clients[1]._id,
                filingDate: new Date('2025-07-30'),
            },
        ];

        await Case.insertMany(cases);
        console.log('Data seeded successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
