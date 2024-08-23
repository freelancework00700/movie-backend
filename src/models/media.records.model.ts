import { Sequelize, Model, DataTypes } from 'sequelize';

export interface MediaRecordsInfo {
    id: string;
    filename: string;
    sys_filename: string;
    size: string;
    extension: string;
    is_deleted: boolean
}

export class MediaRecords extends Model {
    public id!: string;
    public filename!: string;
    public sys_filename!: string;
    public size!: string;
    public extension!: string;
    public is_deleted!: boolean;

    static initModel(connection: Sequelize) {
        MediaRecords.init({
            id: {
                type: DataTypes.STRING(255),
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            filename: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            sys_filename: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            size: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            extension: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            is_deleted: {
                type: new DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            tableName: 'media_record',
            sequelize: connection,
            freezeTableName: true,
            timestamps: true
        });
    }

    static initAssociations() {
        // define association here
    }
}