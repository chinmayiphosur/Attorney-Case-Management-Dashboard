const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ cases: [], clients: [] });

        const searchRegex = new RegExp(q, 'i');

        const [cases, clients] = await Promise.all([
            Case.find({
                attorney: req.user._id,
                $or: [
                    { title: searchRegex },
                    { caseNumber: searchRegex },
                    { court: searchRegex }
                ]
            }).limit(5).populate('client', 'name'),
            Client.find({
                attorney: req.user._id,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex }
                ]
            }).limit(5)
        ]);

        res.json({ cases, clients });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: 'Server search error' });
    }
});

module.exports = router;
