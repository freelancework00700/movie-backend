import { Router } from 'express';
import { UserController } from '../contollers/user.controller';

export class UserRoutes {
    public userController: UserController = new UserController();
    public router: Router = Router();

    constructor() {
        this.config();
    }

    private config(): void {
        this.router.post('/', this.userController.createUser);
        this.router.get('/', this.userController.getAllUsers);
        this.router.get('/:id', this.userController.getUserById);
        this.router.post('/login', this.userController.loginUser);
    }
}