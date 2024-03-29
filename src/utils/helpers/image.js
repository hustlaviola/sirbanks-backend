import cloudinary from '../../config/cloudinary';

/**
 * @function uploadImage
 * @description Upload avatar to cloudinary
 * @param {object} image - Image being uploaded
 * @param {string} publicId
 * @param {object} type - Image category being uploaded
 * @param {object} role - Rider or driver
 * @returns {object} JSON response
 */
const uploadImage = async (image, publicId, type, role = 'driver') => cloudinary.v2.uploader.upload(
    image.tempFilePath, {
        width: type === 'avatar' ? '200' : undefined,
        crop: 'limit',
        folder: `${role}s/${type}s/`,
        public_id: publicId,
        invalidate: true
    }
);

/**
 * @function uploadBase64Image
 * @description Upload avatar to cloudinary
 * @param {object} image - Image being uploaded
 * @param {string} publicId
 * @param {object} type - Image category being uploaded
 * @param {object} role - Rider or driver
 * @returns {object} JSON response
 */
export const uploadBase64Image = async (image, publicId, type, role = 'driver') => cloudinary.v2.uploader.upload(
    image, {
        width: type === 'avatar' ? '200' : undefined,
        crop: 'limit',
        folder: `${role}s/${type}s/`,
        public_id: publicId,
        invalidate: true
    }
);

// /**
//  * @function uploadImage
//  * @description Upload avatar to cloudinary
//  * @param {object} image - Image being uploaded
//  * @param {string} email
//  * @param {object} type - Image category being uploaded
//  * @returns {object} JSON response
//  */
// const uploadImage = (image, email, type) => cloudinary.v2.uploader.upload(
//     image, {
//         width: type === 'avatar' ? '200' : undefined,
//         crop: 'limit',
//         folder: `drivers/${type}/`,
//         public_id: email,
//         invalidate: true
//     }
// );

export default uploadImage;
