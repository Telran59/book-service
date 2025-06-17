import {sequelize} from '../config/database.js';
import {DataTypes} from 'sequelize';

const Publisher = sequelize.define('Publisher', {
    publisherName: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true,
        }
    }
}, {
    tableName: 'publishers',
    timestamps: false,
})

export default Publisher;