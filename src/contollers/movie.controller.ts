import { Request, Response } from "express";
import { HttpStatus } from "../utils/http-status";
import { Movie } from "../models/movie.model";
import { sequelize } from "../server";
import { Op } from "sequelize";
import { MediaRecords } from "../models/media.records.model";
import { User } from "../models/user.model";
import { getPaginationOptions, isValidPublishingYear } from "../utils/common";
import fs from "fs";
import path from 'path';

export class MovieController extends HttpStatus {

    /** GET API: Get All Movies API */
    public getAllMovies = async (req: Request, res: Response) => {
        const { id: userId } = res.locals.auth;
        try {
            const { search, page, limit } = req.query;
            const where: any = { user_id: userId, is_deleted: false };

            if (search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { publishing_year: { [Op.like]: `%${search}%` } },
                ];
            }
            const options: any = {
                where: where,
                include: [{ model: User, as: 'user' }, { model: MediaRecords, as: 'media' }],
                order: [['createdAt', 'DESC']],
            };

            if (page && limit) {
                const paginationOptions = getPaginationOptions(page, limit);
                options.limit = paginationOptions.limit;
                options.offset = paginationOptions.offset;
            }

            const { rows: movies, count } = await Movie.findAndCountAll(options);
            if (count === 0) return this.sendBadRequestResponse(res, "No movies found.");

            return this.sendOkResponse(res, "Movies fetched successfully.", { count, movies });
        } catch (err) {
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /**GET API: Get Movies By Id API */
    public getMovieById = async (req: Request, res: Response) => {
        const { id: userId } = res.locals.auth;
        try {
            const { id } = req.params;
            
            const movie = await Movie.findOne({
                where: {
                    id,
                    user_id: userId,
                    is_deleted: false
                },
                include: [{ model: User, as: 'user' }, { model: MediaRecords, as: 'media' }],
                order: [['createdAt', 'DESC']],
            });
            if (!movie) return this.sendBadRequestResponse(res, "No movie found.");

            return this.sendOkResponse(res, "Movie fetched successfully.", movie);
        } catch (err) {
            if (err instanceof Error) {
                this.sendBadRequestResponse(res, err.message);
            }
        }
    };

    /**POST API: Create Movie API */
    public CreateMovie = async (req: Request, res: Response) => {
        const { id: userId } = res.locals.auth;
        const transaction = await sequelize.transaction();
        try {
            const { title, publishing_year } = req.body;
            // if (!title || !publishing_year) return this.sendBadRequestResponse(res, "Title and publishing year are required.");

            if (!isValidPublishingYear(publishing_year)) {
                return this.sendBadRequestResponse(res, "Invalid publishing year.");
            }

            const existingMovie = await Movie.findOne({ 
                where: { 
                    title,
                    user_id: userId 
                }
            });
            if (existingMovie) return this.sendBadRequestResponse(res, "Movie exists with same title.");

            if (!req.file) return this.sendBadRequestResponse(res, "Image is required.");

            const file = req.file;
            const mediaObj = {
                filename: file.originalname,
                sys_filename: file.filename,
                extension: path.extname(file.originalname),
                size: file.size
            }
            const createMedia = await MediaRecords.create(mediaObj, { transaction });
            const media_id = createMedia.id;

            const movie = await Movie.create({ title, publishing_year, media_id, user_id: userId }, { transaction });
            await transaction.commit();
            return this.sendOkResponse(res, "Movie Created successfully.", movie);
        } catch (err) {
            await transaction.rollback();
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /**PUT API: Update Movie API */
    public updateMovie = async (req: Request, res: Response) => {
        const { id: userId } = res.locals.auth;
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { title, publishing_year } = req.body;

            const movie = await Movie.findOne({ where: { id, user_id: userId, is_deleted: false } });
            if (!movie) return this.sendBadRequestResponse(res, "Movie not found.");
            if (title) {
                const existingMovie = await Movie.findOne({
                    where: { title, id: { [Op.ne]: id }, user_id: userId, is_deleted: false }
                });
                if (existingMovie) return this.sendBadRequestResponse(res, "Movie exists with the same title.");
            }
            if(publishing_year){
                if (!isValidPublishingYear(publishing_year)) {
                    return this.sendBadRequestResponse(res, "Invalid publishing year.");
                }    
            }

            let media_id;
            if (req.file) {
                const oldImage = await MediaRecords.findOne({ where: { id: movie.media_id } });
                if (oldImage) {
                    const directory = path.resolve(__dirname, '../../public/media');
                    // Update old image record
                    await oldImage.update({ is_deleted: true }, { transaction });

                    // remove old file 
                    const oldImagePath = path.join(directory, oldImage.sys_filename);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }

                // Save new media
                const file = req.file;
                const mediaObj = {
                    filename: file.originalname,
                    sys_filename: file.filename,
                    extension: path.extname(file.originalname),
                    size: file.size
                }
                const createMedia = await MediaRecords.create(mediaObj, { transaction });
                media_id = createMedia.id;
            }

            // Update movie record
            await movie.update({ title, publishing_year, media_id }, { transaction });

            await transaction.commit();
            return this.sendOkResponse(res, "Movie updated successfully.", movie);
        } catch (err) {
            await transaction.rollback();
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);
        }
    };

    /** DELETE API: Delete Movie API */
    public deleteMovie = async (req: Request, res: Response) => {
        const { id: userId } = res.locals.auth;
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;

            const movie = await Movie.findOne({ where: { id, user_id: userId, is_deleted: false } });
            if (!movie) return this.sendBadRequestResponse(res, "Movie not found.");

            const oldImage = await MediaRecords.findOne({ where: { id: movie.media_id } });
            if (oldImage) {
                const directory = path.resolve(__dirname, '../../public/media');
                // Update old image record
                await oldImage.update({ is_deleted: true }, { transaction });

                // Optionally, remove old file from the filesystem 
                const oldImagePath = path.join(directory, oldImage.sys_filename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await movie.update({ is_deleted: true }, { transaction });
            await transaction.commit();
            return this.sendOkResponse(res, "Movie deleted successfully.", movie);
        } catch (err) {
            await transaction.rollback();
            if (err instanceof Error) return this.sendBadRequestResponse(res, err.message);

        }
    };
}