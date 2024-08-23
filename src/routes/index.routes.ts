import { Router } from 'express';
import { UserRoutes } from './user.routes';
import { MovieRoutes } from './movie.routes';

export class Routes {
    public router = Router();

    // Create routes instances
    private userRoutes: UserRoutes = new UserRoutes();
    private movieRoutes: MovieRoutes = new MovieRoutes();

    constructor() {
        // Initialize routes
        this.router.use('/user', this.userRoutes.router);
        this.router.use('/movie', this.movieRoutes.router);
    }
}