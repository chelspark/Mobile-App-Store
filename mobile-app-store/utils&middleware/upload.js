const {GridFsStorage} = require('multer-gridfs-storage');
const multer = require('multer');
require('dotenv').config();
const URL = process.env.MONGOOSE_URL;

/* Multer configuration for file uploads */

const storage = new GridFsStorage({
    url: URL,
    file: (req, file) => {
        let bucketName
        console.log('multer working!');
        console.log('Mine type:', file.mimetype)
        if(file.mimetype === 'application/vnd.android.package-archive' || 
            file.mimetype === 'application/octet-stream') {
            bucketName = 'apks'
        } else if(file.mimetype.startsWith('image/')) {
            bucketName = 'screenshots'
        } else {
            console.log('Incorrect Type File Rejected: ', file.originalname);
            return null //Promise.reject(new Error('File type no supported'))
        }

        console.log('Bucket Name: ', bucketName)

        return {
            bucketName,
            filename: Date.now() + `-${file.originalname}`
        }
    }
})

const upload = multer({storage});

module.exports = upload;