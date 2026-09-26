const payload = {
    features: {
        age: 30,
        sleep_duration: 7.5,
        sleep_quality_score: 8,
        physical_activity_minutes: 45,
        steps_per_day: 8000,
        stress_level: 4,
        screen_time_hours: 3.0,
        night_screen_time_minutes: 30,
        social_media_hours: 1.0,
        caffeine_intake_mg: 100,
        alcohol_consumption_drinks: 0,
        diet_quality: 8,
        work_hours_per_day: 8.0,
        commute_time_minutes: 30,
        heart_rate_resting: 65,
        heart_rate_variability: 50,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
        bmi: 22.5,
        gender: "Male",
        country: "USA",
        occupation: "Software Engineer",
        bedtime: "23:00",
        wakeup_time: "07:00",
        sleep_disorder_risk: "Low",
        workout_type: "Cardio",
        work_type: "Remote",
        smoking_status: "Never",
        medication_usage: "missing"
    }
};

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/predictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        if (data.data) {
            console.log("Prediction:", data.data.prediction);
            console.log("Top SHAP feature:", data.data.ranked_contributions[0].feature);
        } else {
            console.log(data);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
