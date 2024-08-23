import { Router } from 'express';
import { MovieController } from '../contollers/movie.controller';
import { MediaService } from './../services/media.service';
import { Middleware } from '../Middleware/auth.middleware';

export class MovieRoutes {
    public movieController: MovieController = new MovieController();
    public router: Router = Router();
    public mediaService: MediaService = new MediaService();
    public middleware: Middleware = new Middleware();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.post('/', this.middleware.authMiddleware, this.mediaService.uploadImage, this.movieController.CreateMovie);
        this.router.get('/', this.middleware.authMiddleware, this.movieController.getAllMovies);
        this.router.get('/:id', this.middleware.authMiddleware, this.movieController.getMovieById);
        this.router.put('/:id', this.middleware.authMiddleware, this.mediaService.uploadImage, this.movieController.updateMovie);
        this.router.delete('/:id', this.middleware.authMiddleware, this.movieController.deleteMovie);
    }
}