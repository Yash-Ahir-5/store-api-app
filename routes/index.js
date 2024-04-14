const express = require("express");
const uploadPhoto = require("../middleware/Upload_Photo");
const {registerUser,loginUser} = require("../controllers/User_Controller");
const { verifyToken } = require("../middleware/Verify_User");
const { createCategory, listCategory, updateCategory, deleteCategory } = require("../controllers/Categories_Controller");
const { addProducts, updateProduct, deleteProduct, listProductByUser, searchProducts, listProducts } = require("../controllers/Products_Controller");
const { EmailUsers } = require("../controllers/Email_Controllers");
const router = express();

router.get('/', (req, res) => {
    res.send("Hello")
})

router.get('/public/assets/:filename', (req, res) => {
    res.sendFile(`../public/assets/${req.params.filename}`);
})

//User's API
router.post('/register',uploadPhoto.single("profile_pic"),registerUser);
router.post('/login',loginUser);

//Category API
router.get('/category',verifyToken,listCategory);
router.post('/category/add',verifyToken,createCategory); 
router.post('/category/update/:id',verifyToken,updateCategory); 
router.delete('/category/delete/:id',verifyToken,deleteCategory);

//Product API
router.get("/product/userwise", verifyToken, listProductByUser);
router.get("/product", verifyToken, listProducts);
router.post("/product/search", verifyToken, searchProducts);
router.post('/product/add',verifyToken,uploadPhoto.array("product_images"),addProducts);
router.post('/product/update/:id',verifyToken,uploadPhoto.array("product_images"),updateProduct);
router.delete('/product/delete/:id',verifyToken,deleteProduct);

router.post('/email',EmailUsers);

module.exports = router;