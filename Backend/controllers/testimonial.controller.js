const Testimonial = require("../models/testimonial.model");

// Create testimonial (always saved as isApproved=false)
exports.addTestimonial = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const testimonial = await Testimonial.create({
      user: userId,
      message: message.trim(),
      isApproved: false
    });

    return res.status(201).json({ success: true, testimonial });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get only approved testimonials (public)
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true, isDeleted: false }).populate("user", "name");
    return res.status(200).json({ success: true, testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get all testimonials (admin only)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isDeleted: false }).populate("user", "name");
    return res.status(200).json({ success: true, testimonials });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Update testimonial (admin only)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isApproved } = req.body;

    const testimonial = await Testimonial.findOne({ _id: id, isDeleted: false });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    if (message !== undefined) testimonial.message = message.trim();
    if (isApproved !== undefined) testimonial.isApproved = !!isApproved;

    await testimonial.save();
    return res.status(200).json({ success: true, testimonial });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Delete testimonial (admin only) - Soft delete
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findOne({ _id: id, isDeleted: false });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    testimonial.isDeleted = true;
    await testimonial.save();
    return res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
