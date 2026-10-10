import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_CONTEXT = `
You are the official CareSync Clinical AI Assistant, an expert medical telemetry and AI system guide.
CareSync Key Architecture:
1. IoT Hardware: ESP8266 Microcontroller Edge Gateway with MAX30102 Heart Rate/SpO2 sensor, DS18B20 body temp probe, and Lead II ECG module.
2. Backend: FastAPI / Django microservices, PostgreSQL (clinical metadata) + MongoDB (sensor streams).
3. AI Engine: PyTorch Explainable AI (SHAP feature attribution for arrhythmia & risk scoring) and Federated Learning (FedAvg with Differential Privacy ε=0.5).
4. Features: Realtime 3D Telemetry dashboard, 2-step Doctor appointment booking wizard, and patient risk reporting.

CRITICAL FORMATTING DIRECTIVE:
Do NOT output raw markdown asterisks (like ***, **, or *), hashes (#), or markdown syntax. Write clean, natural, professional sentences. Use clean bullet points (•) for lists if needed.
`;

function sanitizeText(raw) {
  if (!raw) return "";
  return raw
    .replace(/\*{2,3}/g, "")         // Remove *** and **
    .replace(/^\s*\*\s+/gm, "• ")     // Replace list * with clean bullet •
    .replace(/\*/g, "")              // Remove any remaining single asterisks
    .replace(/^#+\s*/gm, "")         // Remove header hashes
    .trim();
}

function getSmartFallback(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("esp8266") || lower.includes("hardware") || lower.includes("sensor") || lower.includes("kit")) {
    return "CareSync utilizes an ESP8266 NodeMCU microcontroller connected to MAX30102 (Heart Rate & SpO2), DS18B20 (Waterproof Body Temp), and Lead II ECG sensors. Data is filtered locally with FFT noise reduction before streaming over TLS 1.3 MQTT/REST.";
  }
  if (lower.includes("shap") || lower.includes("ai") || lower.includes("explainable")) {
    return "Our PyTorch AI pipeline uses SHAP (SHapley Additive exPlanations) to break down patient risk scores into clear feature attributions—such as ST-segment elevation (+28%), Troponin I (+34%), and Systolic BP (+18%)—giving clinicians full transparency into AI warnings.";
  }
  if (lower.includes("secure") || lower.includes("privacy") || lower.includes("federated") || lower.includes("data")) {
    return "Patient privacy is guarded using Federated Learning (FedAvg with Differential Privacy ε=0.5). Raw patient health records never leave hospital premises; only encrypted model weight gradients are aggregated.";
  }
  if (lower.includes("appointment") || lower.includes("doctor") || lower.includes("book")) {
    return "You can book appointments via our 2-step Telehealth Wizard under '/appointments'. Select from 20+ specialized physicians, choose an available time slot, and receive instant confirmation!";
  }
  return "CareSync is a Next-Gen Remote Patient Telemetry platform featuring ESP8266 IoT sensors, Explainable AI (SHAP), Federated Privacy (ε=0.5), and 3D Realtime Health Monitoring. How can I help you further?";
}

async function runChat(prompt) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      history: [
        { role: "user", parts: [{ text: "Who are you?" }] },
        { role: "model", parts: [{ text: SYSTEM_CONTEXT }] }
      ]
    });

    const result = await chat.sendMessage(prompt);
    return sanitizeText(result.response.text());
  } catch (err) {
    console.warn("Gemini API call warning, using Smart Telemetry Fallback:", err.message);
    return sanitizeText(getSmartFallback(prompt));
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message } = req.body;
  try {
    const responseText = await runChat(message || "Hello");
    res.status(200).json({ response: sanitizeText(responseText) });
  } catch (error) {
    res.status(200).json({ response: sanitizeText(getSmartFallback(message || "")) });
  }
}