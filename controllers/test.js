const sequelize = require("../../utils/sequelize");

const deleteCategory = async (req, res) => {
  //Get the categoryId from the params
  const { categoryId } = req.params;

  //Get the userId from the request
  const createdBy = req.user.userId;

  //Get the role of the user from  the request
  const userRole = req.user.roleName;

  try {
    const category = await sequelize.query(
      `SELECT * FROM categories WHERE categoryId = :categoryId`,
      {
        replacements: { categoryId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    //Check if the user is not an admin and the category was not created by the user
    if (userRole !== "admin" && category[0].createdBy !== createdBy) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    //Delete the category
    await sequelize.query(
      `DELETE FROM categories WHERE categoryId = :categoryId`,
      {
        replacements: { categoryId },
        type: sequelize.QueryTypes.DELETE,
      }
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = deleteCategory;