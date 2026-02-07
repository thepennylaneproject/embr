export declare class UploadService {
    uploadFile(_file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadVideo(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
