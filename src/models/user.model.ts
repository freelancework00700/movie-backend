import { Sequelize, Model, DataTypes } from 'sequelize';

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    password: string;
    is_deleted: boolean;
}

export class User extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public is_deleted!: boolean;

    static initModel(connection: Sequelize) {
        User.init({
            id: {
                type: DataTypes.STRING(255),
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            email: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            password: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            is_deleted: {
                type: new DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            tableName: 'user',
            sequelize: connection,
            freezeTableName: true,
            timestamps: true
        });
    }

    static initAssociations() {
        // define association here
    }
}