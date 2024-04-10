const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/db");

const listCategory = async (req, res) => {

    try {
        console.log("Try Entered");
        const { id, user_role } = req.obj;
        // console.log(id, user_role);

        let showCategoryByUser = null;
        let showCategoryByAdmin = null;
        if (user_role != 1) {
            showCategoryByUser = await sequelize.query(
                `SELECT categories.categoryname, users.firstname, users.lastname FROM categories 
                INNER JOIN users ON categories.createdBy = users.id
                WHERE categories.createdBy = ?`,
                {
                    type: QueryTypes.SELECT,
                    replacements: [id],
                }
            );
            if (showCategoryByUser.length == 0) {
                return res.status(400).json({
                    error: "NOTHING! to show, you don't have any category",
                });
            }
            return res.status(200).json({
                status: "Your category",
                showCategoryByUser,
            });
        } else {
            showCategoryByAdmin = await sequelize.query(
                `SELECT categories.categoryname, CONCAT(users.firstname, ' ', users.lastname) AS createdBY FROM categories 
                INNER JOIN users ON categories.createdBy = users.id`,
                {
                    type: QueryTypes.SELECT,
                }
            );
            if (showCategoryByAdmin.length == 0) {
                return res.status(400).json({
                    error: "NOTHING! to show, there's no category exist",
                });
            }
            return res.status(200).json({
                status: "success",
                showCategoryByAdmin,
            });
        }
        
    } catch (error) {
        console.log("Catch Entered");
        return res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    const { categoryname } = req.body;

    const id = req.obj.id;
    try {
        const { id, user_role } = req.obj;
        console.log(id, user_role);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    if (!categoryname) {
        return res.status(400).json({ message: "categoryname is required" });
    }

    try {
        // console.log("Try Entered");
        const categoryExists = await sequelize.query(
            "select * from categories where categoryname = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [categoryname.toLowerCase()],
            }
        );

        if (categoryExists.length) {
            return res.status(400).json({ message: "Category Already Exists" });
        }

        await sequelize.query(
            "INSERT INTO categories (categoryname, createdBy) VALUES (:categoryname, :id)",
            {
                replacements: { categoryname, id },
                type: QueryTypes.INSERT,
            }
        );

        return res.status(200).json({ message: "Category Added" });
    } catch (error) {
        // console.log("Catch Entered");
        return res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { updateCategoryName } = req.body;
    const { firstname, userRole } = req.obj;
  
    if (!updateCategoryName) {
      return res.status(400).json({ error: "Update category field is empty" });
    }
    try {
      const categoryId = req.params.id;
      const { id } = req.obj;
  
      const [categoryDetail] = await sequelize.query(
        "select * from categories where id = ?",
        {
          type: QueryTypes.SELECT,
          replacements: [categoryId],
        }
      );
      if (categoryDetail == undefined) {
        return res.status(404).json({ error: "No category found....!" });
      }
  
      if (userRole != 1) {
        if (id != categoryDetail.createdBy) {
          return res.status(400).json({
            error: `Category does not belong's to you Dear.${firstname}`,
          });
        }
      }
  
      const checkUpdatedCategoryName = await sequelize.query(
        "select * from categories where categoryname = ?",
        {
          type: QueryTypes.SELECT,
          replacements: [updateCategoryName.toLowerCase()],
        }
      );
  
      if (checkUpdatedCategoryName.length != 0) {
        return res
          .status(409)
          .json({ error: "The new category name already exist" });
      }
  
      const changeCategoryNameQuery = await sequelize.query(
        "UPDATE `categories` SET `categoryname` = ? WHERE `categories`.`id` = ?",
        {
          type: QueryTypes.UPDATE,
          replacements: [updateCategoryName.toLowerCase(), categoryDetail.id],
        }
      );
  
      if (!changeCategoryNameQuery) {
        return res
          .status(400)
          .json({ error: "Something happen while updating the query" });
      }
  
      res.status(200).json({
        status: "success",
        msg: `'${categoryDetail.categoryname}' is changed to '${updateCategoryName}'`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    listCategory,
    createCategory,
    updateCategory
}