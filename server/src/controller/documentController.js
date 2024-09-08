const Document = require('../model/Document');

exports.createDocument = async (req, res) => {
  try {
    const document = new Document({
      title: req.body.title,
      content: req.body.content,
      owner: req.user.id,
      collaborators: [req.user.id]
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Error creating document', error: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ $or: [{ owner: req.user.id }, { collaborators: req.user.id }] });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('owner', 'username');
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (!document.collaborators.includes(req.user.id) && document.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

exports.joinDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (!document.collaborators.includes(req.user.id)) {
      document.collaborators.push(req.user.id);
      await document.save();
    }
    res.json(document);
  } catch (error) {
    console.error('Error joining document:', error);
    res.status(500).json({ message: 'Error joining document', error: error.message });
  }
};