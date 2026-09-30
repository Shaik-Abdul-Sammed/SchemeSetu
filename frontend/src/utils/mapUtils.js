/**
 * Map & Navigation Utilities for SchemeSetu
 * Generates accurate Google Maps directions URLs linking user's actual GPS or
 * selected reference location to the target Channel Partner / Nodal center.
 * Includes walking, driving, transit, live operational status, and multi-lingual
 * spoken directions for illiterate and tribal beneficiaries.
 */

export function getDirectionsUrl(partner, userLocation = null, mode = 'driving') {
  if (!partner) return '';

  const pLat = partner.coordinates?.lat ?? partner.lat ?? null;
  const pLng = partner.coordinates?.lng ?? partner.lng ?? null;

  const uLat = userLocation?.lat ?? userLocation?.latitude ?? null;
  const uLng = userLocation?.lng ?? userLocation?.longitude ?? null;

  // Build origin parameter from user's current GPS or district
  let originParam = '';
  if (uLat && uLng) {
    originParam = `&origin=${uLat},${uLng}`;
  } else if (userLocation?.district && userLocation?.state) {
    originParam = `&origin=${encodeURIComponent(`${userLocation.district}, ${userLocation.state}, India`)}`;
  } else if (userLocation?.address) {
    originParam = `&origin=${encodeURIComponent(userLocation.address)}`;
  }

  const travelMode = mode === 'walking' ? 'walking' : (mode === 'transit' ? 'transit' : 'driving');

  // Build destination
  if (pLat && pLng) {
    return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${pLat},${pLng}&travelmode=${travelMode}`;
  }

  const destParts = [partner.name, partner.address, partner.district, partner.state, 'India'].filter(Boolean);
  const destQuery = encodeURIComponent(destParts.join(', '));
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destQuery}&travelmode=${travelMode}`;
}

export function getWalkingDirectionsUrl(partner, userLocation = null) {
  return getDirectionsUrl(partner, userLocation, 'walking');
}

export function getTransitDirectionsUrl(partner, userLocation = null) {
  return getDirectionsUrl(partner, userLocation, 'transit');
}

export function openDirectionsInMaps(partner, userLocation = null, mode = 'driving') {
  const url = getDirectionsUrl(partner, userLocation, mode);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Computes live open/closed status based on center schedule
 */
export function isPartnerOpenNow(partner) {
  if (!partner) return { isOpen: false, statusText: 'Schedule Unavailable', color: '#64748B' };

  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hour + minutes / 60;

  // Most banks closed on Sunday
  if (day === 0) {
    return {
      isOpen: false,
      statusText: 'Closed Today (Sunday)',
      statusTextTe: 'ఈ రోజు సెలవు (ఆదివారం)',
      statusTextHi: 'आज बंद है (रविवार)',
      color: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeBorder: '#FCA5A5'
    };
  }

  // 2nd and 4th Saturday bank holidays in India
  if (day === 6) {
    const date = now.getDate();
    const isSecondSaturday = date >= 8 && date <= 14;
    const isFourthSaturday = date >= 22 && date <= 28;
    const isBank = (partner.type || '').includes('Bank') || (partner.type || '').includes('RRB');

    if (isBank && (isSecondSaturday || isFourthSaturday)) {
      return {
        isOpen: false,
        statusText: 'Closed (Bank Saturday Holiday)',
        statusTextTe: 'సెలవు (బ్యాంకు శనివారం)',
        statusTextHi: 'बंद है (शनिवार बैंक अवकाश)',
        color: '#DC2626',
        badgeBg: '#FEE2E2',
        badgeBorder: '#FCA5A5'
      };
    }
  }

  // General timings: 10:00 AM (10.0) to 4:00 PM (16.0) or 5:00 PM (17.0)
  const isCsc = (partner.type || '').includes('CSC');
  const openHour = isCsc ? 9.0 : 10.0;
  const closeHour = isCsc ? 18.5 : 16.5;

  if (currentTime >= openHour && currentTime <= closeHour) {
    const closesInHours = (closeHour - currentTime).toFixed(1);
    return {
      isOpen: true,
      statusText: `Open Now • Closes at ${isCsc ? '6:30 PM' : '4:30 PM'}`,
      statusTextTe: `ఇప్పుడు తెరిచి ఉంది • ${isCsc ? 'సాయంత్రం 6:30' : 'సాయంత్రం 4:30'} వరకు`,
      statusTextHi: `अभी खुला है • ${isCsc ? 'शाम 6:30' : 'शाम 4:30'} बजे तक`,
      color: '#059669',
      badgeBg: '#ECFDF5',
      badgeBorder: '#A7F3D0'
    };
  } else if (currentTime < openHour) {
    return {
      isOpen: false,
      statusText: `Closed Now • Opens at ${isCsc ? '9:00 AM' : '10:00 AM'}`,
      statusTextTe: `ప్రస్తుతం మూసి ఉంది • ${isCsc ? 'ఉదయం 9:00' : 'ఉదయం 10:00'} కు తెరుస్తారు`,
      statusTextHi: `अभी बंद है • ${isCsc ? 'सुबह 9:00' : 'सुबह 10:00'} बजे खुलेगा`,
      color: '#D97706',
      badgeBg: '#FFFBEB',
      badgeBorder: '#FDE68A'
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Closed for the day • Opens 10:00 AM tomorrow',
      statusTextTe: 'ఈ రోజుకు ముగిసింది • రేపు ఉదయం 10 గంటలకు తెరుస్తారు',
      statusTextHi: 'आज का समय समाप्त • कल सुबह 10 बजे खुलेगा',
      color: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeBorder: '#FCA5A5'
    };
  }
}

/**
 * Generates spoken navigation guidance for illiterate & tribal beneficiaries
 */
export function getAudioDirectionsText(partner, userLocation = null, lang = 'EN') {
  if (!partner) return '';

  const name = partner.name || 'Welfare Assistance Center';
  const distNum = partner.calculatedDistance !== null && partner.calculatedDistance !== undefined
    ? Number(partner.calculatedDistance)
    : (partner.distanceKm !== null && partner.distanceKm !== undefined ? Number(partner.distanceKm) : null);

  const distStr = distNum !== null ? `${distNum.toFixed(1)} km` : 'nearby';
  const walkMinutes = distNum !== null ? Math.max(2, Math.round(distNum * 12)) : 10;
  const driveMinutes = distNum !== null ? Math.max(1, Math.round(distNum * 2.5)) : 5;

  const landmark = partner.landmark || 'Near Main Bus Stand & Market';
  const landmarkTe = partner.landmarkTe || partner.landmark || 'పాత బస్ స్టాండ్ మరియు మెయిన్ రోడ్ దగ్గర';
  const landmarkHi = partner.landmarkHi || partner.landmark || 'पुराने बस स्टैंड और मुख्य बाजार के पास';
  const timing = partner.timing || '10:00 AM to 4:00 PM';

  const l = (lang || 'EN').toUpperCase();

  if (l === 'TE') {
    return `నమస్కారం. ${name} మీకు సుమారు ${distStr} దూరంలో ఉంది. ల్యాండ్‌మార్క్: ${landmarkTe}. నడక సమయం దాదాపు ${walkMinutes} నిమిషాలు, వాహనంలో ${driveMinutes} నిమిషాలు. పనివేళలు ${timing}. బ్యాంక్ మేనేజర్‌తో ఫోన్‌లో మాట్లాడేందుకు ఆకుపచ్చ కాల్ బటన్ నొక్కండి, లేదా గూగుల్ మ్యాప్స్ లో దారిని ప్రారంభించండి.`;
  }

  if (l === 'HI' || l === 'BHI') {
    return `नमस्ते। ${name} आपसे लगभग ${distStr} की दूरी पर है। पहचान या लैंडमार्क: ${landmarkHi}। पैदल चलने का समय करीब ${walkMinutes} मिनट और गाड़ी से ${driveMinutes} मिनट है। समय: ${timing}। बैंक अधिकारी से बात करने के लिए हरा फोन बटन दबाएं, या रास्ता देखने के लिए नीला बटन दबाएं।`;
  }

  if (l === 'GON') {
    return `జోహార్. ${name} మీ ఊరుకు ${distStr} దూరములో ఉంది. ల్యాండ్‌మార్క్: ${landmarkTe}. నడక సమయం ${walkMinutes} నిమిషాలు. అధికారి తోటి మాట్లాడటానికి ఆకుపచ్చ ఫోన్ బటన్ నొక్కండి.`;
  }

  if (l === 'TA') {
    return `வணக்கம். ${name} உங்களிடமிருந்து சுமார் ${distStr} தொலைவில் உள்ளது. முக்கிய அடையாளம்: ${landmark}. நடைபயண நேரம் ${walkMinutes} நிமிடங்கள். மேலாளரிடம் பேச பச்சை போன் பொத்தானை அழுத்தவும்.`;
  }

  if (l === 'KN') {
    return `ನಮಸ್ಕಾರ. ${name} ನಿಮ್ಮಿಂದ ಸುಮಾರು ${distStr} ದೂರದಲ್ಲಿದೆ. ಪ್ರಮುಖ ಗುರುತು: ${landmark}. ನಡಿಗೆಯ ಸಮಯ ${walkMinutes} ನಿಮಿಷಗಳು. ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಮಾತನಾಡಲು ಹಸಿರು ಕರೆ ಬಟನ್ ಒತ್ತಿರಿ.`;
  }

  if (l === 'MR') {
    return `नमस्कार. ${name} तुमच्यापासून सुमारे ${distStr} अंतरावर आहे. महत्त्वाची खूण: ${landmark}. पायी जाण्यास सुमारे ${walkMinutes} मिनिटे लागतील. अधिकाऱ्याशी बोलण्यासाठी हिरवे फोन बटण दाबा.`;
  }

  // Default English
  return `Welcome. ${name} is located approximately ${distStr} from your location. Landmark: ${landmark}. Estimated walking time is ${walkMinutes} minutes, or ${driveMinutes} minutes by drive. Operating hours: ${timing}. Tap the green call button to speak directly with the officer, or tap blue button for live turn-by-turn navigation.`;
}
