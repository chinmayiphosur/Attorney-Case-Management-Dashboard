const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const Case = require('../models/Case');
const auth = require('../middleware/auth');

// Setup storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload document to a case
router.post('/:caseId', auth, upload.single('file'), async (req, res) => {
    try {
        const { caseId } = req.params;
        const caseObj = await Case.findById(caseId);

        if (!caseObj) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const newDoc = {
            name: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            type: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date()
        };

        caseObj.documents.push(newDoc);
        await caseObj.save();

        res.status(201).json(caseObj.documents[caseObj.documents.length - 1]);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

// Delete document from a case
router.delete('/:caseId/:docId', auth, async (req, res) => {
    try {
        const { caseId, docId } = req.params;
        const caseObj = await Case.findById(caseId);

        if (!caseObj) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const doc = caseObj.documents.id(docId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Remove from filesystem
        const filePath = path.join(__dirname, '..', doc.url);
        if (fs.existsSync(filePath)) {
            await fs.remove(filePath);
        }

        // Remove from array
        doc.remove();
        await caseObj.save();

        res.json({ message: 'Document deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

module.exports = router;
