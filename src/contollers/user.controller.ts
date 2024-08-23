import { Request, Response } from "express";
import { User, UserInfo } from "../models/user.model";
import { HttpStatus } from "../utils/http-status";
import { sequelize } from "../server";
import { decrypt, encrypt, generateToken, hashAsync } from "../utils/crypto-helper";

export class UserController extends HttpStatus {
    /** POST API: Create User API */
    public createUser = async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) return this.sendBadRequestResponse(res, "Required fields are missing in the request body.");

            const existingUser = await User.findOne({ where: { email, is_deleted: false } });
            if (existingUser) return this.sendBadRequestResponse(res, "User exists with same email.");

            const hashPassword = encrypt(password);
            const user = await User.create({ name, email, password: hashPassword }, { transaction });

            await transaction.commit();
            return this.sendOkResponse(res, "User Created successfully.", user);
        } catch (err) {
            await transaction.rollback();
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /** GET API: Get All Users API */
    public getAllUsers = async (req: Request, res: Response) => {
        try {
            const users: UserInfo[] = await User.findAll({ where: { is_deleted: false } });
            if (!users.length) return this.sendBadRequestResponse(res, "No users found.");

            return this.sendOkResponse(res, "Users fetched successfully.", users);
        } catch (err) {
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /** GET API: Get User By Id API */
    public getUserById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await User.findOne({ where: { id, is_deleted: false } });
            if (!user) return this.sendBadRequestResponse(res, "No user found.");

            return this.sendOkResponse(res, "Users fetched successfully.", user);
        } catch (err) {
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /** POST API: Login User API */
    public loginUser = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) return this.sendBadRequestResponse(res, "Email and Password are required.");

            const user = await User.findOne({ where: { email, is_deleted: false } });
            if (!user) return this.sendBadRequestResponse(res, "User not found, Please verify the email address and try again.");

            const decryptPassword = decrypt(user.password);
            if (decryptPassword != password) return this.sendBadRequestResponse(res, "Incorrect password, Please try again.");

            const jwtToken = generateToken(user);
            return this.sendOkResponse(res, "User Login successfully.", { user, token: jwtToken });
        } catch (err) {
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };
}