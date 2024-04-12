const sequelize = require("../../utils/sequelize");

const updateProduct = async (req, res) => {
  //Get the product details from the request
  const { productName, productDesc, productPrice, categoryName } = req.body;

  // Get product images from the request
  const productImages = req.files
    ? req.files.map((file) => file.filename)
    : null;

  //Get the productId from the request
  const { productId } = req.params;

  //Get the userId from the request
  const createdBy = req.user.userId;

  console.log("createdBy", createdBy);

  //Get the role of the user from  the request
  const userRole = req.user.roleName;

  if (!productName || !productDesc || !productPrice || !categoryName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [product] = await sequelize.query(
      `SELECT * FROM products WHERE productId = :productId`,
      {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("product", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (userRole !== "admin" && product.createdBy !== createdBy) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    // Find or create category
    const [category] = await sequelize.query(
      `SELECT categoryId FROM categories WHERE categoryName = :categoryName AND createdBy = :createdBy`,
      {
        replacements: { categoryName, createdBy },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    let categoryId = category?.categoryId;

    // Create new category if not found
    if (!categoryId) {
      const [newCategory] = await sequelize.query(
        `INSERT INTO categories (categoryName, createdBy) VALUES (:categoryName, :createdBy) RETURNING categoryId`,
        {
          replacements: { categoryName, createdBy },
          type: sequelize.QueryTypes.INSERT,
        }
      );
      categoryId = newCategory?.categoryId;
    }

    // Update product
    await sequelize.query(
      `UPDATE products SET productName = :productName, productDesc = :productDesc, productPrice = :productPrice, productImages = :productImages WHERE productId = :productId`,
      {
        replacements: {
          productName,
          productDesc,
          productPrice,
          productImages: JSON.stringify(productImages),
          productId,
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = updateProduct;