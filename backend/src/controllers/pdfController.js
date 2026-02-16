const { uploadPdf, getPdfUrl, deletePdf } = require('../services/pdfService');
const path = require('path');
const fs = require('fs');

/**
 * Upload PDF file to Cloudinary
 */
async function uploadPdfFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        // Check if file is PDF
        if (req.file.mimetype !== 'application/pdf') {
            fs.unlinkSync(req.file.path); // Delete uploaded file
            return res.status(400).json({ 
                success: false, 
                message: 'Only PDF files are allowed' 
            });
        }

        const publicId = `${Date.now()}_${req.file.originalname.replace('.pdf', '')}`;
        
        // Upload to Cloudinary
        const result = await uploadPdf(req.file.path, publicId);

        // Delete local file after upload
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success: true,
            message: 'PDF uploaded successfully',
            data: {
                publicId: result.public_id,
                url: result.secure_url,
                fileName: req.file.originalname,
                size: result.bytes,
                uploadedAt: new Date()
            }
        });
    } catch (error) {
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('PDF upload controller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error uploading PDF',
            error: error.message
        });
    }
}

/**
 * Get PDF URL
 */
async function getPdfFile(req, res) {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required'
            });
        }

        const url = getPdfUrl(publicId);

        return res.status(200).json({
            success: true,
            data: { url }
        });
    } catch (error) {
        console.error('Get PDF controller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving PDF',
            error: error.message
        });
    }
}

/**
 * Delete PDF
 */
async function deletePdfFile(req, res) {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required'
            });
        }

        const result = await deletePdf(publicId);

        return res.status(200).json({
            success: true,
            message: 'PDF deleted successfully',
            data: result
        });
    } catch (error) {
        console.error('Delete PDF controller error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting PDF',
            error: error.message
        });
    }
}

module.exports = {
    uploadPdfFile,
    getPdfFile,
    deletePdfFile
};
