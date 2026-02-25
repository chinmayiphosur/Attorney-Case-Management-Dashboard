const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(auth);

// Get all cases for the authenticated attorney
router.get('/', async (req, res) => {
    try {
        const cases = await Case.find({ attorney: req.user.id }).populate('client');
        res.json(cases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a case assigned to the authenticated attorney
router.post('/', async (req, res) => {
    try {
        const caseData = { ...req.body, attorney: req.user.id };
        const newCase = new Case(caseData);
        const savedCase = await newCase.save();
        res.status(201).json(savedCase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a case only if it belongs to the authenticated attorney
router.put('/:id', async (req, res) => {
    try {
        const updatedCase = await Case.findOneAndUpdate(
            { _id: req.params.id, attorney: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedCase) {
            return res.status(404).json({ message: 'Case not found or unauthorized' });
        }
        res.json(updatedCase);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a case only if it belongs to the authenticated attorney
router.delete('/:id', async (req, res) => {
    try {
        const deletedCase = await Case.findOneAndDelete({ _id: req.params.id, attorney: req.user.id });
        if (!deletedCase) {
            return res.status(404).json({ message: 'Case not found or unauthorized' });
        }
        res.json({ message: 'Case deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
