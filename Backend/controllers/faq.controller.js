const FAQ = require("../models/faq.model");

// User submits a question
exports.addQuestion = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const faq = await FAQ.create({
      question: question.trim(),
      askedBy: userId,
      answer: "",
      isApproved: false
    });

    return res.status(201).json({ success: true, faq });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Public: only approved FAQs
exports.getApprovedFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isApproved: true, isDeleted: false }).populate("askedBy", "name");
    return res.status(200).json({ success: true, faqs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isDeleted: false }).populate("askedBy", "name");
    return res.status(200).json({ success: true, faqs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Update FAQ (admin only)
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, isApproved } = req.body;

    const faq = await FAQ.findOne({ _id: id, isDeleted: false });
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    if (question !== undefined) faq.question = question.trim();
    if (answer !== undefined) faq.answer = String(answer);
    if (isApproved !== undefined) faq.isApproved = !!isApproved;

    await faq.save();
    return res.status(200).json({ success: true, faq });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Delete FAQ (admin only) - Soft delete
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findOne({ _id: id, isDeleted: false });
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq.isDeleted = true;
    await faq.save();
    return res.status(200).json({ success: true, message: "FAQ deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Admin answers a FAQ (sets answer + approves)
exports.answerFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: "Answer is required" });
    }

    const faq = await FAQ.findOne({ _id: id, isDeleted: false });
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq.answer = answer.trim();
    faq.isApproved = true;

    await faq.save();
    return res.status(200).json({ success: true, faq });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
