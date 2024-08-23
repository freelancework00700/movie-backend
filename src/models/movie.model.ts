import { Sequelize, Model, DataTypes } from 'sequelize';
import { MediaRecords } from './media.records.model';
import { User } from './user.model';

export interface MovieInfo {
    id: string;
    title: string;
    publishing_year: number;
    media_id: string
    is_deleted: boolean
}

export class Movie extends Model {
    public id!: string;
    public title!: string;
    public publishing_year!: number;
    public media_id!: string;
    public is_deleted!: boolean;

    static initModel(connection: Sequelize) {
        Movie.init({
            id: {
                type: DataTypes.STRING(255),
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            title: {
                type: new DataTypes.STRING(255),
                allowNull: false
            },
            publishing_year: {
                type: new DataTypes.INTEGER,
                allowNull: false
            },
            media_id: {
                type: new DataTypes.STRING(255),
                allowNull: true,
            },
            user_id:{
                type: new DataTypes.STRING(255),
                allowNull: false,
            },
            is_deleted: {
                type: new DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            tableName: 'movie',
            sequelize: connection,
            freezeTableName: true,
            timestamps: true
        });
    }

    static initAssociations() {
        Movie.belongsTo(MediaRecords, { foreignKey: 'media_id', as: 'media' });
        Movie.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    }
}