const express = require("express");
const uploadPhoto = require("../middleware/Upload_Photo");
const {registerUser,loginUser} = require("../controllers/User_Controller");
const { verifyToken } = require("../middleware/Verify_User");
const { createCategory, listCategory, updateCategory } = require("../controllers/Categories_Controller");
const router = express();

router.get('/', (req, res) => {
    res.send("Hello")
})

//User's API
router.post('/register',uploadPhoto,registerUser);
router.get('/login',loginUser);

//Category API
router.get('/category',verifyToken,listCategory);
router.post('/category/add',verifyToken,createCategory); 
// router.post('/category/update/:id',verifyToken,updateCategory); 

module.exports = router;