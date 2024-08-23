import { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Movie } from './movie.model';
import { MediaRecords } from './media.records.model';

export const initMySQLModels = (connection: Sequelize) => {
    // init models here
    User.initModel(connection);
    MediaRecords.initModel(connection);
    Movie.initModel(connection);

    // init associations here
    Movie.initAssociations();
};

    