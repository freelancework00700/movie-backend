import { Request, Response, NextFunction } from "express";
import multer, { Multer } from "multer";
import { HttpStatus } from "../utils/http-status";
import fs from "fs";
import path from "path";

export class MediaService extends HttpStatus {
    private upload: Multer;

    constructor() {
        super();

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const directory = './public/media';
                fs.mkdirSync(directory, { recursive: true });
                cb(null, directory);
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        });

        this.upload = multer({ storage });
        this.uploadImage = this.uploadImage.bind(this)
    }

    public uploadImage(req: Request, res: Response, next: NextFunction) {
        this.upload.single('image')(req, res, (err: any) => {
            // if (err) {
            //     const errorMsg = err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE'
            //         ? "Only single file you can upload."
            //         : "Error uploading file.";
            //     return this.sendBadRequestResponse(res, errorMsg);
            // }
            if (req.file && !/\.(jpg|jpeg|png|gif|webp)$/.test(req.file.originalname.toLowerCase())) {
                return this.sendBadRequestResponse(res, "Please upload a valid image file (jpg, jpeg, png, gif, webp).");
            }
            next();
        });
    }
}
