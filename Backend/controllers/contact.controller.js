const Contact = require("../models/contact.model");

// User submits a contact form
exports.addContact = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, subject, and message are required" 
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      user: userId,
      isAnswered: false,
      answer: ""
    });

    return res.status(201).json({ success: true, contact });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get all contacts (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ isDeleted: false }).populate("user", "name email");
    return res.status(200).json({ success: true, contacts });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Update contact (admin only)
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, message, isAnswered, answer } = req.body;

    const contact = await Contact.findOne({ _id: id, isDeleted: false });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    if (name !== undefined) contact.name = name.trim();
    if (email !== undefined) contact.email = email.trim();
    if (subject !== undefined) contact.subject = subject.trim();
    if (message !== undefined) contact.message = message.trim();
    if (isAnswered !== undefined) contact.isAnswered = !!isAnswered;
    if (answer !== undefined) contact.answer = String(answer);

    await contact.save();
    return res.status(200).json({ success: true, contact });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Delete contact (admin only) - Soft delete
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findOne({ _id: id, isDeleted: false });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    contact.isDeleted = true;
    await contact.save();
    return res.status(200).json({ success: true, message: "Contact deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Admin answers a contact (sets answer + marks as answered)
exports.answerContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: "Answer is required" });
    }

    const contact = await Contact.findOne({ _id: id, isDeleted: false });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    contact.answer = answer.trim();
    contact.isAnswered = true;

    await contact.save();
    return res.status(200).json({ success: true, contact });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Mark contact as read (admin only)
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findOne({ _id: id, isDeleted: false });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    contact.isRead = true;
    await contact.save();
    return res.status(200).json({ success: true, contact });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
