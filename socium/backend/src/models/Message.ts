// This file defines the Message model, representing the structure of message data in the application.

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

export class Message extends Model {
    public id!: number;
    public content!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Message.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'messages',
    timestamps: true,
});