const CheckIn = require('../models/CheckIn');
const Prediction = require('../models/Prediction');
const mlService = require('../services/mlService');
const baselineService = require('../services/baselineService');
const confidenceService = require('../services/confidenceService');

exports.createCheckIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userProfile = req.user.profile || {};
    
    // 1. Validate and Save Check-In
    const checkIn = new CheckIn({
      ...req.body,
      user: userId
    });
    const savedCheckIn = await checkIn.save();

    // 1b. Fetch latest DigitalWellbeing record for integration
    const DigitalWellbeing = require('../models/DigitalWellbeing');
    const latestWellbeing = await DigitalWellbeing.findOne({ user: userId }).sort({ date: -1 });

    // 2. Prepare ML Features and Data Provenance
    const screenTimeHours = latestWellbeing ? latestWellbeing.total_screen_time_hours : 4.0;
    const socialMediaHours = latestWellbeing ? (latestWellbeing.social_media_minutes / 60) : 1.5;
    const nightScreenTimeMinutes = latestWellbeing ? latestWellbeing.night_screen_time_minutes : (savedCheckIn.nightScreenTimeMinutes || 0);

    const features = {
      // User Input (Check-In)
      sleep_duration: savedCheckIn.sleepDuration,
      stress_level: savedCheckIn.stressLevel,
      sleep_quality_score: savedCheckIn.sleepQuality || 7,
      physical_activity_minutes: savedCheckIn.physicalActivityMinutes || 0,
      
      // Digital Wellbeing Data
      screen_time_hours: screenTimeHours,
      social_media_hours: socialMediaHours,
      night_screen_time_minutes: nightScreenTimeMinutes,

      // Profile integration (with fallbacks)
      age: userProfile.age !== undefined ? userProfile.age : 30,
      gender: userProfile.gender !== undefined ? userProfile.gender : "Non-binary",
      occupation: userProfile.occupation !== undefined ? userProfile.occupation : "Student",
      work_type: userProfile.work_type !== undefined ? userProfile.work_type : "Hybrid",
      work_hours_per_day: userProfile.work_hours_per_day !== undefined ? userProfile.work_hours_per_day : 8.0,
      commute_time_minutes: userProfile.commute_time_minutes !== undefined ? userProfile.commute_time_minutes : 45,
      bedtime: userProfile.bedtime !== undefined ? userProfile.bedtime : "23:00",
      wakeup_time: userProfile.wakeup_time !== undefined ? userProfile.wakeup_time : "07:00",
      workout_type: userProfile.workout_type !== undefined ? userProfile.workout_type : "Mixed",

      // Remaining System Defaults
      steps_per_day: 7000,
      caffeine_intake_mg: 100,
      alcohol_consumption_drinks: 0,
      diet_quality: 7,
      heart_rate_resting: 65,
      heart_rate_variability: 50,
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      bmi: 23.0,
      country: "USA",
      sleep_disorder_risk: "Low",
      smoking_status: "Never",
      medication_usage: "None"
    };

    // Explicitly define data provenance
    const provenance = {
      // Check-In
      sleep_duration: "user_input",
      stress_level: "user_input",
      sleep_quality_score: savedCheckIn.sleepQuality !== undefined ? "user_input" : "default",
      physical_activity_minutes: savedCheckIn.physicalActivityMinutes !== undefined ? "user_input" : "default",
      
      // Digital Wellbeing
      screen_time_hours: latestWellbeing ? "digital_wellbeing" : "default",
      social_media_hours: latestWellbeing ? "digital_wellbeing" : "default",
      night_screen_time_minutes: latestWellbeing ? "digital_wellbeing" : (savedCheckIn.nightScreenTimeMinutes !== undefined ? "user_input" : "default"),
      
      // Profile
      age: userProfile.age !== undefined ? "user_profile" : "default",
      gender: userProfile.gender !== undefined ? "user_profile" : "default",
      occupation: userProfile.occupation !== undefined ? "user_profile" : "default",
      work_type: userProfile.work_type !== undefined ? "user_profile" : "default",
      work_hours_per_day: userProfile.work_hours_per_day !== undefined ? "user_profile" : "default",
      commute_time_minutes: userProfile.commute_time_minutes !== undefined ? "user_profile" : "default",
      bedtime: userProfile.bedtime !== undefined ? "user_profile" : "default",
      wakeup_time: userProfile.wakeup_time !== undefined ? "user_profile" : "default",
      workout_type: userProfile.workout_type !== undefined ? "user_profile" : "default",

      // Remaining Defaults
      steps_per_day: "default",
      caffeine_intake_mg: "default",
      alcohol_consumption_drinks: "default",
      diet_quality: "default",
      heart_rate_resting: "default",
      heart_rate_variability: "default",
      blood_pressure_systolic: "default",
      blood_pressure_diastolic: "default",
      bmi: "default",
      country: "default",
      sleep_disorder_risk: "default",
      smoking_status: "default",
      medication_usage: "default"
    };

    // 3. Send prediction payload
    let mlResponse = null;
    let savedPrediction = null;
    const dq = confidenceService.calculateDataQuality(provenance);
    try {
      mlResponse = await mlService.getPrediction(features, 'felt_rested');
      
      // 4. Save Prediction doc
      const topFactors = mlResponse.ranked_contributions.slice(0, 5).map(c => ({
          feature: c.feature,
          impact: c.direction,
          value: c.contribution
      }));

      

      const prediction = new Prediction({
          user: userId,
          checkIn: savedCheckIn._id,
          score: mlResponse.prediction,
          confidence: 'High',
          contributingFactors: topFactors,
          provenance: provenance,
          dataQuality: dq
      });
      savedPrediction = await prediction.save();
    } catch (mlError) {
      console.error("ML Service failed during check-in:", mlError.message);
      // We continue, allowing the check-in to succeed even if ML is down.
    }

    // 5. Personal Baseline
    const baseline = await baselineService.calculateBaseline(userId, savedCheckIn);

    // 6. Display Result
    res.status(201).json({
      success: true,
      checkIn: savedCheckIn,
      prediction: mlResponse,
      provenance: provenance,
          dataQuality: dq,
      baseline: baseline,
      message: mlResponse ? "Check-in and prediction complete" : "Check-in saved, but prediction service is currently unavailable"
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getCheckIns = async (req, res, next) => {
  try {
    const checkIns = await CheckIn.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(checkIns);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.getCheckInById = async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-In not found' });
    }
    // Verify ownership
    if (checkIn.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to access this check-in' });
    }
    res.status(200).json(checkIn);
  } catch (error) {
    res.status(400);
    next(error);
  }
};


