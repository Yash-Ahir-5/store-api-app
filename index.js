const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const sequelize = require('./utils/db');
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
//Configuration dotenv
dotenv.config();

//Fetching Port from .env file
const PORT = process.env.PORT || 4000

//Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/api', require('./routes'));

sequelize;

app.use("/", require("./routes"));
app.use("/public", express.static(path.join(__dirname, "/public/assets")));

app.listen(PORT, () => {    
    console.log("Store Server Started on : "+ PORT)
});
