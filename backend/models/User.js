const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
  age: { type: Number, min: 13, max: 120 },
  gender: { type: String, enum: ['Male', 'Female', 'Non-binary'] },
  occupation: { type: String, enum: ['Student', 'Unemployed', 'Nurse', 'Manager', 'Sales', 'Teacher', 'Doctor', 'Software Engineer'] },
  work_type: { type: String, enum: ['Hybrid', 'Remote', 'On-site'] },
  work_hours_per_day: { type: Number, min: 0, max: 24 },
  commute_time_minutes: { type: Number, min: 0, max: 1440 },
  bedtime: { type: String, enum: ['02:00', '01:00', '22:00', '21:00', '00:00', '23:00'] },
  wakeup_time: { type: String, enum: ['10:00', '05:00', '07:00', '08:00', '06:00', '09:00'] },
  workout_type: { type: String, enum: ['Yoga', 'Mixed', 'Strength', 'Cardio'] }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  preferences: { type: Object, default: {} },
  profile: { type: profileSchema, default: {} }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
