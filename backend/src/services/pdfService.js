const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload PDF to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} publicId - Public ID for the resource
 * @returns {Promise} Upload result
 */
async function uploadPdf(filePath, publicId) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw',
            type: 'upload',
            public_id: publicId,
            format: 'pdf',
            folder: 'pdfs' // Store PDFs in 'pdfs' folder
        });
        return result;
    } catch (error) {
        console.error('PDF Upload error:', error);
        throw error;
    }
}

/**
 * Get PDF URL from Cloudinary
 * @param {string} publicId - Public ID of the PDF
 * @returns {string} Cloudinary URL
 */
function getPdfUrl(publicId) {
    try {
        const url = cloudinary.url(publicId, {
            resource_type: 'raw',
            format: 'pdf',
            sign_url: true,
            secure: true
        });
        return url;
    } catch (error) {
        console.error('Error generating PDF URL:', error);
        throw error;
    }
}

/**
 * Delete PDF from Cloudinary
 * @param {string} publicId - Public ID of the PDF
 * @returns {Promise} Deletion result
 */
async function deletePdf(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw'
        });
        return result;
    } catch (error) {
        console.error('PDF deletion error:', error);
        throw error;
    }
}

/**
 * Get PDF metadata
 * @param {string} publicId - Public ID of the PDF
 * @returns {Promise} Resource metadata
 */
async function getPdfMetadata(publicId) {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: 'raw'
        });
        return result;
    } catch (error) {
        console.error('Error fetching PDF metadata:', error);
        throw error;
    }
}

module.exports = {
    uploadPdf,
    getPdfUrl,
    deletePdf,
    getPdfMetadata
};
