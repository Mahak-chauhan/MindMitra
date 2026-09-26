exports.calculateDataQuality = (provenanceMap) => {
  if (!provenanceMap) {
    return null;
  }

  // Handle both Mongoose Map and standard JS Object
  let provenance = {};
  if (provenanceMap instanceof Map) {
    provenanceMap.forEach((val, key) => {
      provenance[key] = val;
    });
  } else if (typeof provenanceMap.get === 'function') {
    // Mongoose Map fallback
    for (const key of provenanceMap.keys()) {
      provenance[key] = provenanceMap.get(key);
    }
  } else {
    provenance = provenanceMap;
  }

  const keys = Object.keys(provenance);
  if (keys.length === 0) return null;

  const sources = {
    userInput: 0,
    digitalWellbeing: 0,
    userProfile: 0,
    defaults: 0
  };

  keys.forEach(key => {
    const val = provenance[key];
    if (val === 'user_input') sources.userInput++;
    else if (val === 'digital_wellbeing') sources.digitalWellbeing++;
    else if (val === 'user_profile') sources.userProfile++;
    else if (val === 'default') sources.defaults++;
  });

  const total = sources.userInput + sources.digitalWellbeing + sources.userProfile + sources.defaults;
  if (total === 0) return null;

  const provided = sources.userInput + sources.digitalWellbeing + sources.userProfile;
  const percentage = Math.round((provided / total) * 100);

  let level = 'limited';
  let summary = 'Some information is unavailable, so MindMitra used fallback values for part of this insight.';
  
  if (percentage >= 80) {
    level = 'high';
    summary = 'Your current insight uses highly complete information from your check-in, profile, and digital wellbeing data.';
  } else if (percentage >= 50) {
    level = 'moderate';
    summary = 'Your current insight uses information from your check-in, profile, and digital wellbeing data. Some values were filled using system defaults.';
  }

  return {
    level,
    percentage,
    summary,
    sources
  };
};
