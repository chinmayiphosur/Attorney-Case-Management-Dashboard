const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(auth);

// Get all clients for the authenticated attorney
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find({ attorney: req.user.id });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a client assigned to the authenticated attorney
router.post('/', async (req, res) => {
    try {
        const clientData = { ...req.body, attorney: req.user.id };
        const newClient = new Client(clientData);
        const savedClient = await newClient.save();
        res.status(201).json(savedClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a client only if it belongs to the authenticated attorney
router.put('/:id', async (req, res) => {
    try {
        const updatedClient = await Client.findOneAndUpdate(
            { _id: req.params.id, attorney: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found or unauthorized' });
        }
        res.json(updatedClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a client only if it belongs to the authenticated attorney
router.delete('/:id', async (req, res) => {
    try {
        const deletedClient = await Client.findOneAndDelete({ _id: req.params.id, attorney: req.user.id });
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found or unauthorized' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
