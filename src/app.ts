import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Routes } from './routes/index.routes';
import path from "path";

export class App {
    public express: Express = express();
    public routes = new Routes();

    constructor() {
        // Middlewares
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json({ limit: '200mb' }));
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization, Access-Control-Allow-Headers");
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });

        // Routes
        this.express.use('/api/v1', this.routes.router);
        this.express.use('/', express.static(path.join(__dirname, '../public')));

        // Route to check if server is working or not
        this.express.get('/', (req: Request, res: Response) => {
            res.send('Server Works! 🚀🚀 ');
        });

        // If no route is matched
        this.express.use((req: Request, res: Response) => {
            res.status(404).send('Endpoint not found!');
        })
    }
}