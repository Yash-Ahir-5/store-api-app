const { QueryTypes } = require("sequelize");
const sequelize = require("../../utils/sequelize");

const createCategory = async (req, res) => {
  const { categoryName } = req.body;

  const createdBy = req.user.userId;

  if (!categoryName) {
    return res.status(400).json({ message: "categoryName is required" });
  }

  try {
    const categoryExists = await sequelize.query(
      `SELECT categoryName FROM categories WHERE categoryName = :categoryName AND createdBy = :createdBy`,
      {
        replacements: { categoryName, createdBy },
        type: QueryTypes.SELECT,
      }
    );

    if (categoryExists.length) {
      return res.status(400).json({ message: "category already exists" });
    }

    await sequelize.query(
      "INSERT INTO categories (categoryName, createdBy) VALUES (:categoryName, :createdBy)",
      {
        replacements: { categoryName, createdBy },
        type: QueryTypes.INSERT,
      }
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = createCategory;