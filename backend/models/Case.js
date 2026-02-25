const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true }, // e.g., Criminal, Corporate, etc.
  status: { type: String, default: 'Open' }, // e.g., Open, In Progress, Closed
  priority: { type: String, default: 'Medium' }, // e.g., Low, Medium, High, Urgent
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  attorney: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  court: { type: String },
  judge: { type: String },
  opposingCounsel: { type: String },
  filingDate: { type: Date },
  hearingDate: { type: Date },
  internalNotes: { type: String },
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String }, // e.g., application/pdf
    size: { type: Number },
    version: { type: Number, default: 1 },
    uploadedAt: { type: Date, default: Date.now }
  }],
  checklists: [{
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  closingDate: { type: Date },
  resolution: { type: String, enum: ['Won', 'Lost', 'Settled', 'Dismissed', 'Converted', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);
