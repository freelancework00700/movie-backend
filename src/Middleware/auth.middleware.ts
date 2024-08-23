import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../utils/http-status';
import { User } from '../models/user.model';

const SECRET: any = process.env.SECRET_KEY || "";

export class Middleware extends HttpStatus {

    public authMiddleware = (req: Request, res: Response, next: NextFunction) => {

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return this.sendInvalidTokenResponse(res, 'Unauthorized: Invalid Token');

        jwt.verify(token, SECRET, async (err: any, decodeToken: any) => {
            if (err) return this.sendInvalidTokenResponse(res, 'Forbidden: Invalid Token');

            const user: any = await User.findOne({ where: { id: decodeToken.id, is_deleted: false } });
            if (!user) return this.sendInvalidTokenResponse(res, "Invalid token.");

            res.locals.auth = {
                id: decodeToken.id,
                role: decodeToken.role,
                user
            };
            next();
        });
    }
}
