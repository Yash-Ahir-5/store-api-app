const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('store', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
});

(() => {
    sequelize.authenticate()
    .then(() => {
        console.log("Connected to Store database");
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });
})();

module.exports = sequelize