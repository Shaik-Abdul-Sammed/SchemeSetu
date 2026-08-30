const dataService = require('../services/dataService');
const { haversineDistance, isValidCoordinate } = require('../utils/haversine');
const { isNonEmptyString, isPositiveNumber } = require('../utils/validators');

/**
 * POST /api/v1/partners/nearest
 * Finds nearest eligible partners within maxDistance
 */
function getNearestPartners(req, res, next) {
  try {
    const { lat, lng, schemeId, maxDistance = 50 } = req.body || {};

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: lat and lng coordinates are required.'
      });
    }

    const nLat = Number(lat);
    const nLng = Number(lng);
    const nMaxDistance = Number(maxDistance);

    if (!isValidCoordinate(nLat, nLng)) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: Invalid coordinates (lat: ${lat}, lng: ${lng}). Latitude must be between -90 and 90, longitude between -180 and 180.`
      });
    }

    if (!isPositiveNumber(nMaxDistance)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: maxDistance must be a positive number.'
      });
    }

    const allPartners = dataService.getPartners();

    // 1. Filter by scheme, funding availability, and NPA status
    const eligiblePartners = allPartners.filter(partner => {
      // If schemeId is specified, check if partner supports it
      if (schemeId && String(schemeId).trim().length > 0) {
        const targetScheme = String(schemeId).toLowerCase().trim();
        const hasScheme = Array.isArray(partner.schemes) &&
          partner.schemes.some(s => String(s).toLowerCase().trim() === targetScheme);
        if (!hasScheme) return false;
      }

      // fundAvailable must equal true
      if (partner.fundAvailable !== true) {
        return false;
      }

      // npaStatus must NOT be 'high' or 'very high'
      const npa = String(partner.npaStatus || '').toLowerCase().trim();
      if (npa === 'high' || npa === 'very high' || npa === 'critical') {
        return false;
      }

      return true;
    });

    const totalFound = eligiblePartners.length;

    // 2. Compute Haversine distances
    const partnersWithDistance = [];
    for (const partner of eligiblePartners) {
      if (partner.coordinates && isValidCoordinate(Number(partner.coordinates.lat), Number(partner.coordinates.lng))) {
        const distance = haversineDistance(nLat, nLng, partner.coordinates.lat, partner.coordinates.lng);
        partnersWithDistance.push({
          ...partner,
          distance,
          distanceKm: distance,
          distanceText: `${distance.toFixed(2)} km`
        });
      }
    }

    // 3. Filter within maxDistance
    const withinRangeList = partnersWithDistance.filter(p => p.distance <= nMaxDistance);
    const withinRange = withinRangeList.length;

    // 4. Sort ascending by distance
    withinRangeList.sort((a, b) => a.distance - b.distance);

    // 5. Return top 5
    const top5 = withinRangeList.slice(0, 5);

    return res.status(200).json({
      success: true,
      partners: top5,
      totalFound,
      withinRange,
      message: 'Nearest eligible partners found successfully',
      userLocation: {
        lat: nLat,
        lng: nLng
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/partners
 */
function getPartners(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      schemeId,
      fundAvailable,
      npaStatus,
      search
    } = req.query;

    let partners = dataService.getPartners();

    if (type) {
      const typeLower = String(type).toLowerCase();
      partners = partners.filter(p => p.type && p.type.toLowerCase().includes(typeLower));
    }

    if (schemeId) {
      const sLower = String(schemeId).toLowerCase();
      partners = partners.filter(p =>
        p.schemes && p.schemes.some(s => s.toLowerCase() === sLower)
      );
    }

    if (fundAvailable !== undefined) {
      const isAvailable = String(fundAvailable).toLowerCase() === 'true';
      partners = partners.filter(p => p.fundAvailable === isAvailable);
    }

    if (npaStatus) {
      const npaLower = String(npaStatus).toLowerCase();
      partners = partners.filter(p => p.npaStatus && p.npaStatus.toLowerCase() === npaLower);
    }

    if (search) {
      const sLower = String(search).toLowerCase();
      partners = partners.filter(p =>
        (p.name && p.name.toLowerCase().includes(sLower)) ||
        (p.address && p.address.toLowerCase().includes(sLower)) ||
        (p.type && p.type.toLowerCase().includes(sLower))
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const total = partners.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;
    const paginated = partners.slice(offset, offset + limitNum);

    return res.status(200).json({
      partners: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/partners/:id
 */
function getPartnerById(req, res, next) {
  try {
    const { id } = req.params;
    const partner = dataService.getPartnerById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: `Partner with ID '${id}' not found`
      });
    }

    return res.status(200).json(partner);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/partners/register
 */
function registerPartner(req, res, next) {
  try {
    const { name, type, coordinates, schemes, fundAvailable, npaStatus, address, phone } = req.body || {};

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ success: false, error: 'Validation failed: name is required.' });
    }
    if (!isNonEmptyString(type)) {
      return res.status(400).json({ success: false, error: 'Validation failed: type is required.' });
    }
    if (!coordinates || typeof coordinates !== 'object') {
      return res.status(400).json({ success: false, error: 'Validation failed: coordinates object with lat and lng is required.' });
    }
    if (!isValidCoordinate(Number(coordinates.lat), Number(coordinates.lng))) {
      return res.status(400).json({ success: false, error: 'Validation failed: valid lat (-90 to 90) and lng (-180 to 180) coordinates are required.' });
    }

    const newPartner = dataService.addPartner({
      name,
      type,
      coordinates: {
        lat: Number(coordinates.lat),
        lng: Number(coordinates.lng)
      },
      schemes: Array.isArray(schemes) ? schemes : [],
      fundAvailable: fundAvailable !== undefined ? Boolean(fundAvailable) : true,
      npaStatus: npaStatus || 'low',
      address: address || '',
      phone: phone || ''
    });

    return res.status(201).json({
      success: true,
      partner: newPartner,
      message: 'Partner registered successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNearestPartners,
  getPartners,
  getPartnerById,
  registerPartner
};
