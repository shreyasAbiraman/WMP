import { TrustedContact } from '../models/TrustedContact.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await TrustedContact.find({ userId: req.user._id }).sort({ priorityOrder: 1, createdAt: 1 });
    return successResponse(res, { contacts }, 'Trusted contacts retrieved');
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, relationship, phoneNumber, email, preferredNotifyMethod, priorityOrder } = req.body;

    const contactCount = await TrustedContact.countDocuments({ userId: req.user._id });
    if (contactCount >= 10) {
      return errorResponse(res, 'You can add up to 10 trusted contacts.', 400);
    }

    const contact = await TrustedContact.create({
      userId: req.user._id,
      name,
      relationship,
      phoneNumber,
      email: email || '',
      preferredNotifyMethod: preferredNotifyMethod || 'sms',
      priorityOrder: priorityOrder || contactCount + 1,
    });

    return successResponse(res, { contact }, 'Trusted contact added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contact = await TrustedContact.findOne({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return errorResponse(res, 'Contact not found or unauthorized', 404);
    }
    return successResponse(res, { contact }, 'Contact retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await TrustedContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return errorResponse(res, 'Contact not found or unauthorized', 404);
    }

    return successResponse(res, { contact }, 'Contact updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await TrustedContact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) {
      return errorResponse(res, 'Contact not found or unauthorized', 404);
    }
    return successResponse(res, null, 'Contact removed successfully');
  } catch (error) {
    next(error);
  }
};
