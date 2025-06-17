import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

const Author = sequelize.define('Author', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true,
        }
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'authors',
    timestamps: false,
})

export default Author;