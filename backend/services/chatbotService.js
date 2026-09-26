const { buildUserContext } = require('./chatContextService');
const ChatHistory = require('../models/ChatHistory');

const SYSTEM_PROMPT = `You are Mitra, the MindMitra AI Companion. 
Your role is to help users understand their MindMitra predictions, wellness roadmaps, and provide general wellbeing guidance.

CRITICAL RULES:
1. You are NOT the prediction model. Do NOT generate new prediction scores.
2. When explaining a score, use ONLY the exact SHAP factors provided in the context. Do NOT invent or infer SHAP values. 
3. When explaining SHAP values, state that the factor "contributed to the model's prediction." Do NOT say it "caused" the score.
4. When explaining a roadmap task, use the exact rule-based "reason" provided in the context. Do NOT invent different reasons.
5. You are NOT a doctor or therapist. Do not diagnose conditions (like depression or anxiety). Keep advice general and non-diagnostic.
6. SAFETY BOUNDARY: If the user expresses immediate danger, self-harm intent, or intent to harm another person, IMMEDIATELY stop normal interaction and respond with a brief supportive safety-oriented message encouraging them to contact local emergency services or a crisis resource.
7. Be concise, warm, and empathetic. Use simple formatting.`;

exports.processMessage = async (userId, message) => {
  // 1. Get Context
  const userContext = await buildUserContext(userId);
  
  // 2. Format Context for LLM
  const contextString = JSON.stringify(userContext, null, 2);
  const fullPrompt = `USER CONTEXT:\n${contextString}\n\nUSER MESSAGE:\n${message}`;

  // 3. Setup LLM Provider
  const provider = process.env.LLM_PROVIDER || 'mock';
  const apiKey = process.env.GEMINI_API_KEY;

  let aiResponse = "";

  if (provider === 'gemini' && apiKey) {
    // Basic Fetch to Gemini API
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: { text: SYSTEM_PROMPT } },
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'LLM API Error');
      }
      
      aiResponse = data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error('LLM Provider failed:', err);
      aiResponse = "Mitra is temporarily unavailable. Your prediction and roadmap are still available. Please try again later.";
    }
  } else {
    // Fallback Mock Behavior
    aiResponse = "AI Companion is not configured yet. You can still explore your prediction, roadmap, diary, and wellness activities.";
  }

  // 4. Save to History (User + Assistant)
  try {
    await ChatHistory.insertMany([
      { user: userId, role: 'user', message },
      { user: userId, role: 'assistant', message: aiResponse }
    ]);
  } catch (err) {
    console.error('Failed to save chat history', err);
  }

  return aiResponse;
};

exports.getHistory = async (userId) => {
  return await ChatHistory.find({ user: userId }).sort({ timestamp: 1 }).limit(50);
};
