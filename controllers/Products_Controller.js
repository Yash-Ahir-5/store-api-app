const { QueryTypes } = require("sequelize");
const sequelize = require("../utils/db");

const listProducts = async (req, res) => {
    try {
        const data = await sequelize.query("select * from products", {
            type: QueryTypes.SELECT,
        });

        if (data.length == 0) {
            return res.status(204).json({ error: "Nothing to show....!" });
        }

        res.status(200).json({ status: "success", data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error", msg: err.message });
    }
};

const listProductByUser = async (req, res) => {
    try {
        const { id, firstname, gender, userRole } = req.obj;

        // const sql = `select products.id, name, description, categoryId, 
        // price, images from products LEFT JOIN categories on products.categoryId = categories.id
        //  LEFT JOIN users on users.id = categories.createdBy WHERE users.id = 21;`;

        const userProducts = await sequelize.query(
            `select products.id, name, description, categoryId, 
            price, product_images from products LEFT JOIN categories on products.categoryId = categories.id
            LEFT JOIN users on users.id = categories.createdBy WHERE users.id = ?`,
            {
                type: QueryTypes.SELECT,
                replacements: [id],
            }
        );

        if (userProducts.length == 0) {
            res.status(400).json({ error: "No products to show" });
        }

        const userCategories = await sequelize.query(
            "select categories.*, CONCAT(users.firstname, ' ', users.lastname) AS createdBy FROM categories INNER JOIN users ON categories.createdBy = users.id WHERE categories.createdBy = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [id],
            }
        );


        res.status(200).json({ stauts: "success", userProducts, userCategories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addProducts = async (req, res) => {
    const removePPicIfErr = (req) => {
        console.log('removePPicIfErr() function hits......')
        if (req && req.files && req.files.length > 0) {
            console.log("in if");
            req.files.forEach(file => {
                console.log(file.filename);
               
                    fs.unlink(`./public/assets/${file.filename}`, (err) => {
                        if (err) {
                            console.error("Error:", err.message);
                        }
                    });
                
            });
        }
    };

    const { name, description, categoryId, price } = req.body;
    const { user_role, id } = req.obj;

    const product_images = [];

    req.files.forEach((file) => {
        console.log(file.filename);
        product_images.push(file.filename);
    });

    if (!name) {
        removePPicIfErr();
        return res.status(400).json({
            message: "Name is required",
        });
    }

    if (!description || description.trim() === "") {
        removePPicIfErr();
        return res.status(400).json({
            message: "Description is required",
        });
    }

    if (!categoryId || categoryId.trim() === "") {
        removePPicIfErr();
        return res.status(400).json({
            message: "Category ID is required",
        });
    }

    if (!price || isNaN(price) || price <= 0) {
        removePPicIfErr();
        return res.status(400).json({
            message: "Price must be a positive number",
        });
    }

    if (
        !product_images ||
        !Array.isArray(product_images) ||
        product_images.length === 0
    ) {
        removePPicIfErr();
        return res.status(400).json({
            message: "At least one image is required",
        });
    }

    try {
        const nameExist = await sequelize.query(
            "select * from products where name = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [name],
            }
        );

        if (nameExist.length != 0) {
            removePPicIfErr();
            return res.status(409).json({ error: "Name already in use" });
        }

        const checkCategory = await sequelize.query(
            "select * from categories where id = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [categoryId],
            }
        );

        if (checkCategory == 0) {
            removePPicIfErr();
            return res.status(400).json({ error: "Category does not exist." });
        }

        if (user_role != 1) {
            const checkCategoryByUser = await sequelize.query(
                `select id from categories where id = ? and createdBy = ?`,
                {
                    type: QueryTypes.SELECT,
                    replacements: [categoryId, id],
                }
            );

            if (checkCategoryByUser == 0) {
                removePPicIfErr();
                return res
                    .status(404)
                    .json({ error: "Category is not created by you" });
            }
        }

        const insertProduct = await sequelize.query(
            "INSERT INTO `products` (`name`, `description`, `categoryId`, `price`, `product_images`) VALUES (?, ?, ?, ?, ?);",
            {
                type: QueryTypes.INSERT,
                replacements: [
                    name,
                    description,
                    categoryId,
                    price,
                    JSON.stringify(product_images),
                ],
            }
        );

        // if(insertProduct){
        //     res.status(200).json({ message : "Product Added "})
        // }else{
        //     res.status(400).json({ message : "Error adding Product"})
        // }
        res.status(200).json({ message: "Product Added " })
        //RETRIVE QUERY for particular -> select * from products LEFT JOIN categories on products.categoryId = categories.id LEFT JOIN users on categories.createdBy = users.id WHERE users.id = 3;
    } catch (err) {
        removePPicIfErr();
        return res
            .status(500)
            .json({ error: "Internal server error", msg: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, categoryId, price } = req.body;
        const { user_role, id, firstname } = req.obj;

        const product_images = [];
        req.files.forEach((file) => {
            product_images.push(file.filename);
        });

        const [checkProduct] = await sequelize.query(
            "select * from products where id = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [productId],
            }
        );

        if (checkProduct == undefined) {
            return res.status(404).json({ error: "Product not found" });
        }

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

        if (user_role != 1) {
            if (id != categoryDetail.createdBy) {
                return res.status(400).json({
                    error: `Category does not belong's to you Dear.${firstname} you cannot update the product`,
                });
            }
        }

        const updateProduct = await sequelize.query(
            `UPDATE products SET name = ?, description = ?, categoryId = ?, price = ?, product_images = ? WHERE products.id = ?`,
            {
                type: QueryTypes.UPDATE,
                replacements: [
                    name || checkProduct.name,
                    description || checkProduct.description,
                    categoryId || checkProduct.categoryId,
                    price || checkProduct.price,
                    JSON.stringify(product_images) || checkProduct.images,
                    productId,
                ],
            }
        );

        if (!updateProduct) {
            return res
                .status(400)
                .json({ error: "Error while updating the product" });
        }

        res.status(200).json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { user_role, id, firstname } = req.obj;

        const [checkProduct] = await sequelize.query(
            "select * from products where id = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [productId],
            }
        );
        if (checkProduct == undefined) {
            return res.status(404).json({ error: "Product not found to delete" });
        }

        const [categoryDetail] = await sequelize.query(
            "select * from categories where id = ?",
            {
                type: QueryTypes.SELECT,
                replacements: [checkProduct.categoryId],
            }
        );
        if (categoryDetail == undefined) {
            return res.status(404).json({ error: "No category found....!" });
        }

        if (user_role != 1) {
            if (id != categoryDetail.createdBy) {
                return res.status(400).json({
                    error: `Category does not belong's to you Mr.${firstname} you cannot delete the product`,
                });
            }
        }

        const deleteProduct = sequelize.query(
            "DELETE FROM `products` WHERE `products`.`id` = ?",
            {
                type: QueryTypes.DELETE,
                replacements: [productId],
            }
        );

        if (!deleteProduct) {
            return res.status(400).json({
                error: `Error while deleting the product id : '${productId}'`,
            });
        }

        res.status(200).json({
            status: "success",
            msg: `Deleted product id '${productId}' successfully`,
        });
    } catch (err) {
        return res
            .status(500)
            .json({ error: "Internal server error", msg: err.messsage });
    }
};

const searchProducts = async (req, res) => {
    const { search } = req.body;
    try {
        const searchQuery = `%${search}%`;
        const searchitem = await sequelize.query(
            `SELECT * from products where name like ?`,
            {
                replacements: [searchQuery],
                type: QueryTypes.SELECT,
            }
        );

        if (searchitem.length === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ status: "success", result: searchitem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addProducts,
    updateProduct,
    deleteProduct,
    listProducts,
    listProductByUser,
    searchProducts
}