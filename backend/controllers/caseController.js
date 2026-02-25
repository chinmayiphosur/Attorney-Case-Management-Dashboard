const Case = require('../models/Case');

exports.getCases = async (req, res) => {
  const cases = await Case.find();
  res.json(cases);
};

exports.createCase = async (req, res) => {
  const newCase = await Case.create(req.body);
  res.status(201).json(newCase);
};

exports.updateCase = async (req, res) => {
  const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.deleteCase = async (req, res) => {
  await Case.findByIdAndDelete(req.params.id);
  res.json({ message: 'Case deleted' });
};
