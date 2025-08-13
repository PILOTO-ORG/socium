// This file defines the Lead model, representing the structure of lead data in the application.

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export class Lead extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public phone!: string;
    public status!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Lead.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new',
    },
}, {
    sequelize,
    tableName: 'leads',
    timestamps: true,
});