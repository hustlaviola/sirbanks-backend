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
    // https://res.cloudinary.com/viola/image/upload/v1596876441/riders/avatars/PB-5ffa0549-01f9-49ed-b616-80deb7dc0971.png
    // https://res.cloudinary.com/viola/image/upload/v1596876248/riders/avatars/PB-5ffa0549-01f9-49ed-b616-80deb7dc0971.png
    // https://res.cloudinary.com/viola/image/upload/v1596876041/riders/avatars/PB-5ffa0549-01f9-49ed-b616-80deb7dc0971.png
    // https://res.cloudinary.com/viola/image/upload/v1596874318/riders/avatars/PB-5ffa0549-01f9-49ed-b616-80deb7dc0971.png
    // https://res.cloudinary.com/viola/image/upload/v1596873803/riders/avatars/PB-5ffa0549-01f9-49ed-b616-80deb7dc0971.png
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
