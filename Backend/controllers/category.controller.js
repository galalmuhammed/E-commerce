const Category = require("../models/category.model");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories to be fetched"
      });
    }
    res.status(200).json({
      success: true,
      message: "Categories fetched succesfully",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const getBody = req.body;
    if (!getBody) {
      return res.status(400).json({
        success: false,
        message: "No body to create"
      });
    }
    const checkIfDuplicate = await Category.findOne({ name: getBody.name });

    if (checkIfDuplicate) {
      return res.status(409).json({
        success: false,
        message: `${getBody.name} is already existed`
      });
    }

    const categories = await Category.create(getBody);

    res.status(201).json({
      success: true,
      message: "Categories created succesfully",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "No id to update"
      });
    }

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "No body to create"
      });
    }
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const checkIfIdFound = await Category.findOne({ _id: id });

    if (!checkIfIdFound) {
      return res.status(404).json({
        success: false,
        message: `${id} is not Found`
      });
    }

    const checkIfDuplicateName = await Category.findOne({ name: name });

    if (checkIfDuplicateName && checkIfDuplicateName._id.toString() !== id) {
      return res.status(409).json({
        success: false,
        message: `${name} is already existed`
      });
    }

    const category = await Category.findByIdAndUpdate(id, { name: name }, { new: true });

    res.status(200).json({
      success: true,
      message: "Category updated succesfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    let id = req.params.id;
    id = id.trim();

    const checkIfId = await Category.findOne({ _id: id });
    if (!checkIfId) {
      return res.status(404).json({
        success: false,
        message: "No category were found"
      });
    }

    const category = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    res.status(203).json({
      success: true,
      message: "Category deleted succesfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
