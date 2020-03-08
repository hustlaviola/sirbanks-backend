import cloudinary from '../../config/cloudinary';

/**
 * @function uploadImage
 * @description Upload avatar to cloudinary
 * @param {object} image - Image being uploaded
 * @param {string} email
 * @param {object} type - Image category being uploaded
 * @returns {object} JSON response
 */
export const uploadImage = (image, email, type) => cloudinary.v2.uploader.upload(
    image.tempFilePath, {
        width: type === 'avatar' ? '200' : undefined,
        crop: 'limit',
        folder: `drivers/${type}/`,
        public_id: email,
        invalidate: true
    }
);

export default uploadImage;