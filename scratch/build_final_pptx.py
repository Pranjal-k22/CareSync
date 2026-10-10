import os
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Constants
    NAVY = RGBColor(15, 23, 42)        # #0f172a
    BLUE = RGBColor(37, 99, 235)       # #2563eb
    LIGHT_BLUE = RGBColor(239, 246, 255)# #eff6ff
    DARK_GRAY = RGBColor(51, 65, 85)   # #334155
    WHITE = RGBColor(255, 255, 255)
    GRAY_BG = RGBColor(248, 250, 252)  # #f8fafc
    BORDER_GRAY = RGBColor(203, 213, 225) # #cbd5e1

    slides_data = [
        {
            "slide_num": 1,
            "title": "HealConnect: IoT & ML Remote Patient Monitoring",
            "subtitle": "B.Tech Final Year Capstone Project Presentation — Review-I",
            "bullets": [
                "Continuous Sub-Second Telemetry Ingestion over MQTT",
                "Machine Learning Deterioration Scoring (Random Forest 94.59% Accuracy)",
                "Explainable AI (SHAP) Clinical Decision Support",
                "Real-Time Server-Sent Events (SSE) Next.js Web Dashboard"
            ],
            "is_title": True
        },
        {
            "slide_num": 2,
            "title": "1. Introduction & Healthcare Context",
            "subtitle": "Addressing Delayed Intervention in Hospital Ward Environments",
            "bullets": [
                "Hospital Spot-Check Gap: Ward vitals recorded manually every 4–8 hours lead to unmonitored decompensation windows.",
                "Clinical Deterioration Risks: Unnoticed sepsis onset, cardiac arrhythmia, or hypoxemia between nurse rounds.",
                "HealConnect Solution: Continuous automated vital sign collection, multi-variable ML deterioration scoring, and low-latency UI alerts.",
                "Target Audience: Physicians, ward nurses, intensive care staff, and hospital administrators."
            ]
        },
        {
            "slide_num": 3,
            "title": "2. Problem Statement & Operational Challenges",
            "subtitle": "Overcoming Static Threshold Alarms & Data Silos",
            "bullets": [
                "False Alarm Fatigue: Traditional bedside monitors trigger alarms on static single thresholds (e.g., HR > 100 bpm), fatiguing clinicians.",
                "Proprietary Lock-in: Legacy medical monitoring hardware streams over isolated non-standard protocols.",
                "Network & Hardware Constraints: Microcontrollers face high memory/bandwidth overhead running WebSockets or REST polling.",
                "Black-Box ML Hesitancy: Clinicians require interpretable feature attribution rather than unexplainable risk scores."
            ]
        },
        {
            "slide_num": 4,
            "title": "3. Project Objectives & Scope",
            "subtitle": "Key Deliverables & Verification Boundaries",
            "bullets": [
                "Sub-Second Ingestion: ESP8266 + MAX30102/DHT22 IoT edge streaming vitals via MQTT (QoS 1).",
                "Predictive Scoring: RandomForest model trained on 167,146 clinical samples achieving 94.59% accuracy & 0.9120 ROC-AUC.",
                "Explainable AI: SHAP TreeExplainer providing per-vital feature attribution vectors.",
                "Verified Scope Boundaries: Core backend & API 100% verified (84/84 PASS); physical ESP8266 board execution marked HARDWARE UNVERIFIED; Lead-II ECG marked SIMULATED."
            ]
        },
        {
            "slide_num": 5,
            "title": "4. Literature Review & Technical Gaps",
            "subtitle": "Comparing Existing Solutions against HealConnect",
            "bullets": [
                "Transport Protocols: WebSockets require high connection framing vs. MQTT 2-byte lightweight headers.",
                "Risk Modeling: Manual NEWS/MEWS scores lag behind automated 14-feature Random Forest ML prediction.",
                "UI Streaming: HTTP REST polling increases server load vs. unidirectional FastAPI Server-Sent Events (SSE).",
                "Privacy Frameworks: Multi-hospital data aggregation secured via Flower Federated Learning and Differential Privacy."
            ]
        },
        {
            "slide_num": 6,
            "title": "5. Proposed HealConnect System Overview",
            "subtitle": "End-to-End IoT Edge to Cloud-Native Streaming UI",
            "bullets": [
                "IoT Edge Subsystem: ESP8266 microcontrollers reading MAX30102 (HR/SpO2) and DHT22 (Temp) sensors.",
                "MQTT Messaging Core: Eclipse Mosquitto Broker with topic hierarchy caresync/{hospital}/{device}/vitals.",
                "Ingestion & ML Core: Python paho-mqtt worker storing vitals, executing risk ML, and calculating SHAP scores.",
                "Client Visual Analytics: FastAPI SSE broadcasting /telemetry/stream to Next.js 16 Recharts UI."
            ]
        },
        {
            "slide_num": 7,
            "title": "6. High-Level System Architecture",
            "subtitle": "5-Tier Decoupled Platform Blueprint",
            "bullets": [
                "Tier 1 (IoT Edge): ESP8266 C++ Firmware (CareSync_Kit_ESP8266_Code.ino).",
                "Tier 2 (MQTT Broker): Mosquitto Ports 1883 (TCP) & 8883 (TLS) with ACL authorization.",
                "Tier 3 (Ingestion & DB): Python paho-mqtt worker + SQLAlchemy ORM (SQLite/Supabase).",
                "Tier 4 (ML & XAI Engine): risk_model.joblib + backend/app/explain.py (SHAP TreeExplainer).",
                "Tier 5 (Streaming & UI): FastAPI SSE broadcaster + Next.js 16 Pages router web client."
            ]
        },
        {
            "slide_num": 8,
            "title": "7. IoT Edge Architecture & Sensor Integration",
            "subtitle": "Firmware Implementation & Hardware Classification",
            "bullets": [
                "ESP8266 Microcontroller: NodeMCU v1.0 running ESP8266WiFi.h & PubSubClient.h.",
                "MAX30102 Pulse Oximeter: Heart Rate (bpm) & SpO2 (%) via I2C interface (SDA/SCL) [Firmware Implemented].",
                "DHT22 / DS18B20 Sensor: Body Temperature (°C) via single-bus digital pin D2 [Firmware Implemented].",
                "Simulated ECG Waveform Stream: Synthetic Lead-II cardiac telemetry stream [SIMULATED].",
                "Hardware Status Disclaimer: Firmware compiled cleanly; physical board execution marked HARDWARE UNVERIFIED."
            ]
        },
        {
            "slide_num": 9,
            "title": "8. MQTT Broker & Messaging Architecture",
            "subtitle": "Eclipse Mosquitto Setup & Quality of Service (QoS)",
            "bullets": [
                "Broker Configuration: mosquitto/config/mosquitto.conf on Port 1883 / 8883 TLS.",
                "Topic Taxonomy: caresync/{hospital_id}/{device_id}/{data_type}",
                "caresync/+/+/vitals: Telemetry JSON payload with QoS 1 delivery guarantee.",
                "caresync/+/+/ecg: Streaming ECG waveform payload with QoS 0 delivery.",
                "caresync/+/+/status: Device connectivity status with Last Will & Testament (LWT QoS 1)."
            ]
        },
        {
            "slide_num": 10,
            "title": "9. Telemetry Ingestion Worker Architecture",
            "subtitle": "Python paho-mqtt Background Processing Service",
            "bullets": [
                "Subscription Loop: Worker listens to caresync/+/+/vitals using paho-mqtt.",
                "Parsing & Validation: Validates numerical parameter bounds (HR: 30–220, SpO2: 50–100%).",
                "Database Insertion: Saves raw vital sign records using SQLAlchemy ORM.",
                "ML Triggering: Invokes risk_model.joblib inference and persists calculated risk scores.",
                "SSE Queue Dispatch: Forwards validated payload to FastAPI SSE broadcaster queue."
            ]
        },
        {
            "slide_num": 11,
            "title": "10. FastAPI Core Backend & REST API Inventory",
            "subtitle": "High-Performance Asynchronous Services (FastAPI 0.115.8)",
            "bullets": [
                "POST /auth/login & /auth/register: OAuth2 password bearer authentication issuing JWT tokens.",
                "GET & POST /patients/: CRUD management for patient demographic and room allocation records.",
                "POST /telemetry/ & GET /telemetry/stream: REST ingestion & real-time SSE stream endpoints.",
                "POST /ml/predict-risk & /ml/explain-risk: Invokes RandomForest inference and SHAP explainability.",
                "Test Coverage: 27/27 core backend Pytest test cases passing (100% success rate)."
            ]
        },
        {
            "slide_num": 12,
            "title": "11. Relational Database Schema & Data Models",
            "subtitle": "SQLAlchemy ORM (SQLite / Supabase PostgreSQL)",
            "bullets": [
                "users: Clinician accounts, bcrypt password hashes, roles (doctor, nurse, admin).",
                "patients: Demographics, age, gender, medical history, assigned room numbers.",
                "devices: Registered ESP8266 IoT hardware MAC addresses assigned to patients.",
                "vitals: Time-series telemetry logs (heart rate, SpO2, body temperature, timestamp).",
                "risk_scores & alerts: Calculated ML risk probability percentages and SHAP contribution vectors."
            ]
        },
        {
            "slide_num": 13,
            "title": "12. Machine Learning Deterioration Model",
            "subtitle": "RandomForest Classifier (94.59% Accuracy, 0.9120 ROC-AUC)",
            "bullets": [
                "Dataset: cleaned_hospital_data.csv containing 167,146 clinical patient observations.",
                "14 Clinical Features: age, gender, heart_rate, spo2, temperature, sys_bp, dia_bp, respiratory_rate, gcs, wbcc, creatinine, lactate, heart_disease_history, diabetes_history.",
                "Pipeline: Median imputation -> StandardScaler -> RandomForestClassifier(n_estimators=100, max_depth=12).",
                "Holdout Evaluation Metrics: Accuracy: 94.59%, ROC-AUC: 0.9120, Precision: 0.9231, Recall: 0.8889, F1: 0.9057."
            ]
        },
        {
            "slide_num": 14,
            "title": "13. Explainable AI (SHAP) Decision Support",
            "subtitle": "Transparent Feature Attribution via TreeExplainer",
            "bullets": [
                "Service Implementation: backend/app/explain.py using shap.TreeExplainer.",
                "Clinical Functionality: Computes mathematical Shapley contribution values for each vital sign.",
                "Transparency Value: Explains to attending doctors WHY a patient was escalated to HIGH RISK.",
                "Example Attribution: Flags SpO2 = 88% as contributing +42% towards high deterioration probability."
            ]
        },
        {
            "slide_num": 15,
            "title": "14. Disease Outbreak & Federated Learning Sandbox",
            "subtitle": "Multi-Hospital Privacy-Preserving ML Infrastructure",
            "bullets": [
                "Outbreak Model: GradientBoostingClassifier trained on 15,000 samples (96.58% Acc, 0.9970 ROC-AUC).",
                "Flower Federated Learning: flwr client/server architecture for multi-hospital model aggregation.",
                "Differential Privacy Prototype: exp_project/federated_differential_privacy.py injecting Laplace noise.",
                "Arrhythmia Prototype: exp_project/ecg_arrhythmia_prototype.py 1D-CNN Isolation Forest model."
            ]
        },
        {
            "slide_num": 16,
            "title": "15. Next.js 16 Web Client & Real-Time SSE UI",
            "subtitle": "Responsive Clinical Monitoring Portal (React 19 / Recharts)",
            "bullets": [
                "pages/dashboard.jsx: Patient risk summary grid, triage cards, and active alert notifications.",
                "pages/live-monitoring.jsx: Sub-second vital streaming view using browser EventSource API.",
                "components/LiveMonitor/: Digital gauge readouts, animated pulse indicators, and ECG visualizer.",
                "Recharts Integration: Dynamic timeseries charts updating without full page re-renders."
            ]
        },
        {
            "slide_num": 17,
            "title": "16. Authentication & System Security",
            "subtitle": "Enterprise Multi-Layer Security Architecture",
            "bullets": [
                "Application Auth: OAuth2 password bearer flow with HS256 signed JWT tokens.",
                "Password Security: Passlib bcrypt password salt hashing for stored user credentials.",
                "MQTT Security: Password file authentication and topic Access Control Lists (ACLs).",
                "Secrets & Logs: Environment variables loaded via .env.local; sensitive tokens redacted as [REDACTED]."
            ]
        },
        {
            "slide_num": 18,
            "title": "18. Docker Containerization & Deployment",
            "subtitle": "Orchestrated Multi-Container Infrastructure (docker-compose.yml)",
            "bullets": [
                "Frontend Container: Next.js 16 web server running on Port 3000.",
                "Backend Container: FastAPI Uvicorn web server running on Port 8000.",
                "Mosquitto Container: Eclipse Mosquitto MQTT broker running on Ports 1883 & 8883 TLS.",
                "Network & Storage: Isolated bridge networks and persistent storage volumes for databases and logs."
            ]
        },
        {
            "slide_num": 19,
            "title": "19. Verification Matrix & Automated Test Results",
            "subtitle": "100% Passing Test Rate Across All Automated Suites",
            "bullets": [
                "Backend Pytest Suite: 27 / 27 PASS (100% test pass rate).",
                "Scratch Stage Automated Tests: 57 / 57 PASS (100% test pass rate).",
                "Total Verified Automated Tests: 84 / 84 PASS (100% overall test pass rate).",
                "Next.js Webpack Build: 45 / 45 pages compiled cleanly with zero build errors."
            ]
        },
        {
            "slide_num": 20,
            "title": "20. Hardware Classification & ECG Disclaimers",
            "subtitle": "Explicit Status Disclaimers for Academic Rigor",
            "bullets": [
                "Physical Edge Hardware: ESP8266 firmware compiled; physical board execution marked HARDWARE UNVERIFIED.",
                "ECG Rhythm Data: Lead-II single-lead ECG signal visualization is software SIMULATED.",
                "Medical Use Disclaimer: HealConnect is a prototype decision support tool; NOT certified for diagnostic clinical use.",
                "Academic Transparency: All software integration components verified via automated test suites."
            ]
        },
        {
            "slide_num": 21,
            "title": "21. Real-World Healthcare Applicability",
            "subtitle": "Clinical Benefits in General Ward Settings",
            "bullets": [
                "Early Warning Automation: Replaces 4-hour spot checks with sub-second continuous monitoring.",
                "Prioritized Triage: Directs nursing staff attention to HIGH RISK patients first.",
                "Reduced Clinician Fatigue: Multi-variable ML scoring prevents false alarms caused by minor vital fluctuations.",
                "Multi-Site Scalability: Standardized MQTT and FHIR R4 export support multi-hospital networks."
            ]
        },
        {
            "slide_num": 22,
            "title": "22. System Limitations & Technical Boundaries",
            "subtitle": "Documented Constraints for Future Engineering Iterations",
            "bullets": [
                "Hardware Verification Constraint: Physical ESP8266 board hardware testing was unavailable during automated testing.",
                "Demographic Data Dependency: ML deterioration model requires patient baseline blood pressure and lactate levels.",
                "ECG Simulation Constraint: Lead-II ECG waveform rendering relies on synthetic signal generation.",
                "SSE Browser Constraint: Server-Sent Events support unidirectional streaming from server to client."
            ]
        },
        {
            "slide_num": 23,
            "title": "23. Future Scope & Development Roadmap",
            "subtitle": "Planned Enhancements & Engineering Roadmap",
            "bullets": [
                "Edge ML Deployment: Implementing TensorFlow Lite for Microcontrollers (TFLite Micro) on ESP32 edge nodes.",
                "HL7 FHIR R4 Integration: Native API endpoints converting telemetry into FHIR Patient and Observation resources.",
                "Physical Hardware Validation: Extended hardware testing with physical MAX30102 pulse oximeter breakout boards.",
                "1D-CNN Arrhythmia Model: Integrating real-time cardiac arrhythmia classification into production FastAPI backend."
            ]
        },
        {
            "slide_num": 24,
            "title": "24. Conclusion & Oral Defense Summary",
            "subtitle": "Summary of HealConnect B.Tech Capstone Project",
            "bullets": [
                "Successfully Developed: Low-latency continuous IoT remote patient monitoring and decision support platform.",
                "Predictive Performance: Random Forest ML model achieves 94.59% accuracy and 0.9120 ROC-AUC.",
                "Explainable Decision Support: SHAP TreeExplainer delivers transparent vital parameter feature contributions.",
                "Fully Verified Software: 84/84 automated test cases passing and 45/45 Next.js pages compiled cleanly."
            ]
        }
    ]

    for data in slides_data:
        slide = prs.slides.add_slide(blank_layout)
        
        if data.get("is_title"):
            # Title Slide Styling
            # Top Banner Shape
            banner = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
            banner.fill.solid()
            banner.fill.fore_color.rgb = NAVY
            banner.line.color.rgb = NAVY

            # Title Box
            tx_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(4.5))
            tf = tx_box.text_frame
            tf.word_wrap = True
            
            p0 = tf.paragraphs[0]
            p0.text = data["title"]
            p0.font.size = Pt(36)
            p0.font.bold = True
            p0.font.color.rgb = WHITE
            p0.alignment = PP_ALIGN.LEFT
            
            p1 = tf.add_paragraph()
            p1.text = data["subtitle"]
            p1.font.size = Pt(20)
            p1.font.color.rgb = RGBColor(147, 197, 253) # Light Blue Accent
            p1.alignment = PP_ALIGN.LEFT
            p1.space_before = Pt(14)
            p1.space_after = Pt(24)

            for b in data["bullets"]:
                pb = tf.add_paragraph()
                pb.text = f"•  {b}"
                pb.font.size = Pt(16)
                pb.font.color.rgb = RGBColor(226, 232, 240)
                pb.space_after = Pt(8)
        else:
            # Standard Content Slide Styling
            # Background
            bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
            bg.fill.solid()
            bg.fill.fore_color.rgb = GRAY_BG
            bg.line.color.rgb = GRAY_BG

            # Top Header Card
            header_card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.4), Inches(12.133), Inches(1.2))
            header_card.fill.solid()
            header_card.fill.fore_color.rgb = NAVY
            header_card.line.color.rgb = NAVY

            header_tf = header_card.text_frame
            header_tf.word_wrap = True
            
            p_head = header_tf.paragraphs[0]
            p_head.text = data["title"]
            p_head.font.size = Pt(22)
            p_head.font.bold = True
            p_head.font.color.rgb = WHITE

            p_sub = header_tf.add_paragraph()
            p_sub.text = data["subtitle"]
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = RGBColor(147, 197, 253)
            p_sub.space_before = Pt(4)

            # Main Content Box
            content_card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.8), Inches(12.133), Inches(5.1))
            content_card.fill.solid()
            content_card.fill.fore_color.rgb = WHITE
            content_card.line.color.rgb = BORDER_GRAY

            content_tf = content_card.text_frame
            content_tf.word_wrap = True
            
            for idx, b in enumerate(data["bullets"]):
                p_bullet = content_tf.paragraphs[0] if idx == 0 else content_tf.add_paragraph()
                p_bullet.text = f"✔   {b}"
                p_bullet.font.size = Pt(16)
                p_bullet.font.color.rgb = DARK_GRAY
                p_bullet.space_before = Pt(10)
                p_bullet.space_after = Pt(10)

    output_path = Path(r"c:\Users\pc\Desktop\capstone\Heal_connectmain2.0\exp_project\HealConnect_Final_Presentation.pptx")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(output_path))
    print(f"SUCCESS: PowerPoint saved to {output_path}")

if __name__ == "__main__":
    create_presentation()
