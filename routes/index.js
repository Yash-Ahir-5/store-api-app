const express = require("express");
const uploadPhoto = require("../middleware/Upload_Photo");
const {registerUser,loginUser} = require("../controllers/User_Controller");
const router = express();

router.get('/', (req, res) => {
    res.send("Hello")
})
router.post('/register',uploadPhoto,registerUser);
router.get('/login',loginUser);

module.exports = router;