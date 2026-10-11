import { PlacesService } from '../services/placesService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getNearbyPlaces = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius, 10) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse(res, 'Valid latitude (lat) and longitude (lng) query parameters are required.', 400);
    }

    const places = await PlacesService.getNearbyPlaces(lat, lng, radius);
    return successResponse(res, { places, searchCoordinates: { lat, lng }, radiusMeters: radius }, 'Nearby safety places retrieved');
  } catch (error) {
    next(error);
  }
};
