import 'dotenv/config';
import { createServer } from 'http';
import { App } from './app';
import env from './utils/validate-env';
import { Sequelize } from 'sequelize';
import { config } from './config/config';
import { initMySQLModels } from './models';

const app = new App();

// Create HTTP server
const httpServer = createServer(app.express);

// Get database configuration
const environment: string = env.NODE_ENV;
const databaseConfiguration = config[environment];

export let sequelize: Sequelize;

try {
    (async () => {
        // Create database connection
        const dbConfiguration = {
            ...databaseConfiguration,
            database: undefined
        }

        // Create a database if it not exists
        sequelize = new Sequelize(dbConfiguration);
        await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${databaseConfiguration.database};`);

        sequelize = new Sequelize(databaseConfiguration);

        // Authenticate database connection and sync models
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        initMySQLModels(sequelize);
        await sequelize.sync({ alter: false });
        console.log("Sequelize OK");

        // Start the server
        httpServer.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });
    })();
}catch(err) {
    console.log("Error: ", err);
    console.log('Unable to connect to the database.');
}

