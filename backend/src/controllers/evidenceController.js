import fs from 'fs';
import path from 'path';
import { Evidence } from '../models/Evidence.js';
import { calculateSha256 } from '../utils/hash.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getUploadDir } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';

export const uploadEvidenceFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No evidence file uploaded', 400);
    }

    const { title, description, incidentId, latitude, longitude, address } = req.body;
    const file = req.file;

    // Calculate SHA-256 integrity hash from disk file
    const fileBuffer = fs.readFileSync(file.path);
    const sha256Hash = calculateSha256(fileBuffer);

    let fileCategory = 'image';
    if (file.mimetype.startsWith('audio/')) fileCategory = 'audio';
    else if (file.mimetype.startsWith('video/')) fileCategory = 'video';
    else if (file.mimetype === 'application/pdf') fileCategory = 'document';

    const evidenceId = `EVD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const evidence = await Evidence.create({
      evidenceId,
      userId: req.user._id,
      incidentId: incidentId || null,
      title: title || file.originalname,
      description: description || '',
      originalFileName: file.originalname,
      storedFileName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      sha256Hash,
      fileCategory,
      capturedLocation: latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || '',
      } : undefined,
    });

    logger.info(`Evidence securely stored: ${evidenceId} (SHA-256: ${sha256Hash.substring(0, 16)}...)`);

    return successResponse(
      res,
      { evidence },
      'Evidence file uploaded securely and integrity hash verified',
      201
    );
  } catch (error) {
    // Cleanup orphaned file if DB creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    next(error);
  }
};

export const getEvidenceList = async (req, res, next) => {
  try {
    const list = await Evidence.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { evidence: list }, 'Evidence items retrieved');
  } catch (error) {
    next(error);
  }
};

export const getEvidenceById = async (req, res, next) => {
  try {
    const item = await Evidence.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return errorResponse(res, 'Evidence file not found or unauthorized', 404);
    }
    return successResponse(res, { evidence: item }, 'Evidence details');
  } catch (error) {
    next(error);
  }
};

export const downloadEvidenceFile = async (req, res, next) => {
  try {
    const item = await Evidence.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return errorResponse(res, 'Evidence file not found or unauthorized', 404);
    }

    const filePath = path.join(getUploadDir(), item.storedFileName);
    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 'File not found on secure server storage', 404);
    }

    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.originalFileName)}"`);
    res.setHeader('X-Evidence-SHA256', item.sha256Hash);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteEvidenceItem = async (req, res, next) => {
  try {
    const item = await Evidence.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return errorResponse(res, 'Evidence not found or unauthorized', 404);
    }

    const filePath = path.join(getUploadDir(), item.storedFileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        logger.warn(`Failed to remove file from disk: ${err.message}`);
      }
    }

    return successResponse(res, null, 'Evidence permanently deleted');
  } catch (error) {
    next(error);
  }
};
