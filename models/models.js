const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db.js')

// ------- User Model ----------
class User extends Model {}

User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    session: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { sequelize });

(async() => {
    await sequelize.sync()
})()

// --------- Tweet Model -----------------
class Tweet extends Model {}

Tweet.init({
    content: DataTypes.STRING,
    timeCreated: DataTypes.DATE
}, { sequelize });

(async() => {
    await sequelize.sync()
})()

//  --------- Setting Relationship ----------
User.hasMany(Tweet)
Tweet.belongsTo(User, { foreignKey: 'fuckingId' });

// ------ sync new tables ------------
(async() => {
    await Tweet.sync({ force: true })
})()

module.exports = { User, Tweet }