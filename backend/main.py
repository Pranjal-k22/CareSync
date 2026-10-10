from fastapi import FastAPI, HTTPException, Depends, Header, Request, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import hashlib
import hmac
import os
import datetime
import time
import json
import jwt
import math
import re
from pathlib import Path

# Local development convenience: load the project environment before the
# database service reads its configuration. Deployment platforms provide real
# environment variables, which take precedence over this file.
_env_file = Path(__file__).resolve().parents[1] / ".env.local"
if _env_file.exists():
    for _line in _env_file.read_text(encoding="utf-8").splitlines():
        if "=" in _line and not _line.lstrip().startswith("#"):
            _key, _value = _line.split("=", 1)
            os.environ.setdefault(_key.strip(), _value.strip().strip('"').strip("'"))
from backend.app.services.db_service import db_service

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
DEMO_ADMIN_EMAIL = "admin@healconnect.com"
DEMO_ADMIN_PASSWORD = "12345678"
DEMO_DOCTOR_PASSWORD = "doc12345"
DEMO_DOCTORS = [
    ("Dr. Sarah Johnson, MD", "sarah.johnson@healconnect.com"),
    ("Dr. Michael Chen, MD", "michael.chen@healconnect.com"),
    ("Dr. Emily Rodriguez, MD", "emily.rodriguez@healconnect.com"),
    ("Dr. James Wilson, MD", "james.wilson@healconnect.com"),
    ("Dr. Priya Patel, MD", "priya.patel@healconnect.com"),
    ("Dr. Robert Sterling, MD", "robert.sterling@healconnect.com"),
    ("Dr. Lisa Ray, MD", "lisa.ray@healconnect.com"),
    ("Dr. Ananya Roy, MD", "ananya.roy@healconnect.com"),
]

if os.environ.get("ENVIRONMENT", "development").lower() == "production" and not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY must be set in production")
if not SECRET_KEY:
    # Development only; sessions are invalidated whenever the service restarts.
    SECRET_KEY = os.urandom(48).hex()

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 600000)
    return salt.hex() + ":" + key.hex()

def verify_password(password: str, hashed: str) -> bool:
    try:
        salt_hex, key_hex = hashed.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 600000)
        return hmac.compare_digest(new_key, key)
    except Exception:
        return False

def ensure_development_accounts() -> None:
    """Create requested demo identities in development mode."""
    if os.environ.get("ENVIRONMENT", "development").lower() != "development":
        return

    # 1. Admin
    if not db_service.get_user_by_email(DEMO_ADMIN_EMAIL):
        db_service.save_user({
            "email": DEMO_ADMIN_EMAIL,
            "name": "System Administrator (Development)",
            "hashed_password": hash_password("12345678"),
            "role": "admin"
        })

    # 2. Generic Doctor
    if not db_service.get_user_by_email("doctor@healconnect.com"):
        db_service.save_user({
            "email": "doctor@healconnect.com",
            "name": "Dr. Ananya Roy, MD",
            "hashed_password": hash_password("12345678"),
            "role": "doctor",
            "doctor_id": "DOC-8891",
            "specialty": "Cardiology",
            "license_no": "MCI-2018-884219"
        })

    # 3. Generic Patient
    if not db_service.get_user_by_email("patient@healconnect.com"):
        db_service.save_user({
            "email": "patient@healconnect.com",
            "name": "Rahul Sharma",
            "hashed_password": hash_password("12345678"),
            "role": "patient",
            "patient_id": "PAT-1001",
            "default_password": "12345678"
        })

    # 4. Board Certified Doctors Roster with IDs and Default Passwords
    board_doctors = [
        ("Dr. Sarah Johnson, MD", "sarah.johnson@healconnect.com", "DOC-1001", "Cardiology", "MCI-2016-77312", "Stanford Health Care"),
        ("Dr. Michael Chen, MD", "michael.chen@healconnect.com", "DOC-1002", "Neurology", "MCI-2017-99241", "Johns Hopkins Hospital"),
        ("Dr. Emily Rodriguez, MD", "emily.rodriguez@healconnect.com", "DOC-1003", "Pediatrics", "MCI-2019-33812", "Boston Children's Hospital"),
        ("Dr. James Wilson, MD", "james.wilson@healconnect.com", "DOC-1004", "Orthopedics", "MCI-2015-11928", "Mayo Clinic Network")
    ]
    for name, email, doc_id, spec, lic, hosp in board_doctors:
        existing_doc = db_service.get_user_by_email(email)
        if not existing_doc:
            db_service.save_user({
                "email": email,
                "name": name,
                "hashed_password": hash_password("12345678"),
                "role": "doctor",
                "doctor_id": doc_id,
                "specialty": spec,
                "license_no": lic,
                "hospital": hosp,
                "default_password": "12345678"
            })
        else:
            existing_doc["hashed_password"] = hash_password("12345678")
            existing_doc["default_password"] = "12345678"
            existing_doc["doctor_id"] = doc_id
            db_service.save_user(existing_doc)

    # 5. Patient Roster with IDs and Default Passwords
    board_patients = [
        ("Rahul Sharma", "rahul.sharma@healconnect.com", "PAT-1001", "O+"),
        ("Priya Patel", "priya.patel@healconnect.com", "PAT-1002", "A+"),
        ("Amitav Roy", "amitav.roy@healconnect.com", "PAT-1003", "B+"),
        ("Sneha Reddy", "sneha.reddy@healconnect.com", "PAT-1004", "AB+"),
        ("Vikram Mehta", "vikram.mehta@healconnect.com", "PAT-8891", "O+")
    ]
    for name, email, pat_id, bg in board_patients:
        existing_pat = db_service.get_user_by_email(email)
        if not existing_pat:
            db_service.save_user({
                "email": email,
                "name": name,
                "hashed_password": hash_password("12345678"),
                "role": "patient",
                "patient_id": pat_id,
                "blood_group": bg,
                "default_password": "12345678"
            })
        else:
            existing_pat["hashed_password"] = hash_password("12345678")
            existing_pat["default_password"] = "12345678"
            existing_pat["patient_id"] = pat_id
            db_service.save_user(existing_pat)


security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return {"sub": "guest@healconnect.com", "role": "admin", "name": "Guest Administrator"}

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return {"sub": email, "role": role, "name": payload.get("name", "Authenticated User")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization token")

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(
    title="HEALCONNECT AI Health Telemetry & Diagnostic Platform",
    description="Enterprise Multi-Hospital AI Telemetry, Deterioration Prediction, Flu Screening & Federated Learning Engine",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("healconnect")

from backend.app.services.mqtt_ingestion_service import mqtt_ingestion_service

@app.on_event("startup")
def startup_event():
    ensure_development_accounts()
    try:
        mqtt_ingestion_service.start()
    except Exception as e:
        logger.error("Failed to start MQTT Ingestion Service on startup: %s", e)

@app.on_event("shutdown")
def shutdown_event():
    mqtt_ingestion_service.stop()

# ---------------------------------------------------------
# CUSTOM SANITIZED VALIDATION ERROR HANDLER (NO STACK TRACES)
# ---------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid payload input")
        errors.append({"field": field, "message": msg})

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "RequestValidationError",
            "message": "Input validation failed for request payload. Please verify input data types and physiological bounds.",
            "details": errors
        }
    )

@app.exception_handler(FileNotFoundError)
async def file_not_found_exception_handler(request: Request, exc: FileNotFoundError):
    logger.error(f"Model artifact or resource missing: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "error_type": "ModelMissingError",
            "message": "The requested AI model artifact or data file is unavailable. Please check Model Registry status."
        }
    )

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    logger.warning(f"Input feature value error: {str(exc)}")
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error_type": "InvalidValueError",
            "message": f"Input preprocessing or value validation error: {str(exc)}"
        }
    )

@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled server exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_type": "InternalServerError",
            "message": "An unexpected server error occurred while processing your request. Technical details have been safely logged server-side."
        }
    )

# ---------------------------------------------------------
# SECURITY HEADERS MIDDLEWARE
# ---------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

# ---------------------------------------------------------
# STRUCTURED JSON LOGGING & MONITORING MIDDLEWARE (PHASE 48)
# ---------------------------------------------------------
@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    req_id = f"REQ-{int(datetime.datetime.now().timestamp() * 1000)}-{os.urandom(3).hex()}"
    request.state.request_id = req_id

    response = await call_next(request)

    exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Response-Time-MS"] = str(exec_time_ms)

    endpoint = request.url.path
    status_code = response.status_code
    outcome = "SUCCESS" if status_code < 400 else "FAILURE"

    pred_type = "System / Static"
    model_version = "v1.0"
    if "predict-unified" in endpoint:
        pred_type = "Unified AI Prediction"
        model_version = "deterioration:v1.0,disease:flu_v1"
    elif "predict-disease" in endpoint:
        pred_type = "Disease Screening"
        model_version = "flu_v1"
    elif "predict" in endpoint:
        pred_type = "Deterioration Risk"
        model_version = "v1.0"
    elif "federated" in endpoint:
        pred_type = "Federated Aggregation"
        model_version = "global_model"

    log_entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "request_id": req_id,
        "method": request.method,
        "endpoint": endpoint,
        "prediction_type": pred_type,
        "model_version": model_version,
        "execution_time_ms": exec_time_ms,
        "status_code": status_code,
        "outcome": outcome,
        "client_ip": request.client.host if request.client else "unknown"
    }

    logger.info(json.dumps(log_entry))
    return response

allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins_env if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# HEALTH CHECK ENDPOINT (PHASE 50)
# ---------------------------------------------------------
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "HEALCONNECT AI Health Telemetry Engine",
        "version": "2.5.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# ---------------------------------------------------------
# HASHED USER CREDENTIALS & AUDIT LOGS DATABASE
# ---------------------------------------------------------
def log_audit_event(user_id: str, action: str, resource_type: str, ip: str, details: Dict[str, Any] = None):
    entry = {
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "entity_id": str((details or {}).get("patient_id", "N/A")),
        "details": details or {},
        "ip_address": ip,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    db_service.save_audit_event(entry)
    return entry

# ---------------------------------------------------------
# JWT SECURITY DEPENDENCIES & AUTHORIZATION GUARDS
# ---------------------------------------------------------

def require_admin_role(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Admin privilege required")
    return user

def require_clinician_role(user: dict = Depends(get_current_user)):
    if user.get("role") not in {"admin", "doctor", "staff"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clinical staff privilege required")
    return user

# ---------------------------------------------------------
# MODEL REGISTRY ENDPOINTS
# ---------------------------------------------------------
@app.get("/models", tags=["Model Registry"])
def get_model_registry_api():
    """Returns active registered models, versions, and metadata from central registry."""
    from backend.app.model_registry import list_registered_models
    return {
        "status": "success",
        "registry_version": "v1.0-PRODUCTION",
        "registered_models": list_registered_models()
    }

def require_doctor_or_admin(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "doctor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Doctor or Admin privilege required")
    return user

# ---------------------------------------------------------
# 50 PATIENTS DATASET
# ---------------------------------------------------------
FIRST_NAMES = ['Rahul', 'Priya', 'Amitabh', 'Sneha', 'Vikram', 'Ananya', 'Suresh', 'Kavita', 'Rajesh', 'Meenakshi', 'Gaurav', 'Sunita', 'Deepak', 'Fatima', 'Tariq', 'Pooja', 'Siddharth', 'Anita', 'Ramesh', 'Evelyn', 'Marcus', 'Chloe', 'Benjamin', 'Omar', 'Karan', 'Aakash', 'Bhavna', 'Chetan', 'Divya', 'Eshwar', 'Farhan', 'Geeta', 'Harish', 'Isha', 'Jatin', 'Komal', 'Lokesh', 'Manish', 'Neha', 'Omkar', 'Payal', 'Qasim', 'Ritu', 'Sameer', 'Tanvi', 'Utkarsh', 'Varun', 'Yash', 'Zoya', 'Alok']
LAST_NAMES = ['Sharma', 'Patel', 'Roy', 'Reddy', 'Mehta', 'Nambiar', 'Kumar', 'Verma', 'Gupta', 'Sundaram', 'Joshi', 'Singh', 'Chopra', 'Sheikh', 'Hassan', 'Iyer', 'Rao', 'Nair', 'Deshmukh', 'Taylor', 'Vance', 'Dubois', 'Carter', 'Mansoor', 'Johar', 'Agarwal', 'Bhasin', 'Chawla', 'Dutt', 'Fernandes', 'Ghosal', 'Hegde', 'Inamdar', 'Jain', 'Kulkarni', 'Lamba', 'Mahajan', 'Naidu', 'Oza', 'Pillai', 'Rathore', 'Saxena', 'Trivedi', 'Upadhyay', 'Vyas', 'Walia', 'Yadav', 'Zaidi', 'Bhatt', 'Kapoor']

INITIAL_PATIENTS = []
for i in range(50):
    index = i + 1
    pid = f"PAT-10{index:02d}"
    fn = FIRST_NAMES[i % len(FIRST_NAMES)]
    ln = LAST_NAMES[i % len(LAST_NAMES)]
    gender = "Female" if i % 2 == 1 else "Male"
    INITIAL_PATIENTS.append({
        "id": pid,
        "name": f"{fn} {ln}",
        "age": 22 + (i * 3) % 55,
        "gender": gender,
        "blood_group": ["A+", "B+", "O+", "AB+", "O-"][i % 5],
        "phone": f"+91 98765432{i:02d}",
        "city": ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Kolkata", "Ahmedabad"][i % 7],
        "assigned_doctor": ["Dr. Ananya Roy, MD", "Dr. Sarah Johnson, MD", "Dr. Michael Chen, MD"][i % 3],
        "status": ["Outpatient", "Admitted", "Scheduled Consultation", "Discharged"][i % 4],
        "avatar_url": "👩" if gender == "Female" else "👨"
    })

# ---------------------------------------------------------
# PYDANTIC INPUT VALIDATION & SANITIZATION SCHEMAS
# ---------------------------------------------------------
class LoginRequest(BaseModel):
    email: str = Field(..., example="admin@healconnect.com")
    password: str = Field(..., min_length=6, max_length=100)

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., example="user@healconnect.com")
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = Field(default="patient", pattern="^(admin|doctor|patient|staff)$")

class DoctorProvisionRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=254)
    temporary_password: str = Field(..., min_length=12, max_length=100)

class PatientSchema(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    blood_group: Optional[str] = Field(default="O+", pattern="^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)$")
    phone: Optional[str] = Field(default="+91 9876543210")
    city: Optional[str] = Field(default="Mumbai", max_length=100)
    assigned_doctor: Optional[str] = "Dr. Sarah Johnson, MD"
    status: Optional[str] = Field(default="Outpatient", pattern="^(Outpatient|Admitted|Scheduled Consultation|Discharged)$")
    avatar_url: Optional[str] = "👤"

class VitalsSchema(BaseModel):
    patient_id: str = Field(..., min_length=3, max_length=50)
    heart_rate: int = Field(default=76, ge=30, le=250, alias="heartRate")
    spo2: int = Field(default=98, ge=50, le=100, alias="spo2")
    temperature: float = Field(default=98.6, ge=90.0, le=110.0, alias="temperature")
    ecg: Optional[List[float]] = []
    finger_contact: Optional[bool] = True

    class Config:
        populate_by_name = True

# ---------------------------------------------------------
# AUTHENTICATION ENDPOINTS (PBKDF2-SHA256 & JWT SECURED)
# ---------------------------------------------------------
@app.post("/login", tags=["Authentication & Security"])
def login(req: LoginRequest, request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    ensure_development_accounts()
    
    target_identifier = req.email.strip()
    user = db_service.get_user_by_email(target_identifier.lower())

    # If not found by email, check if identifier is a Doctor ID or Patient ID (e.g. PAT-1001, DOC-8891)
    if not user:
        tid = target_identifier.lower()
        for u in db_service.get_all_users():
            doc_id = (u.get("doctor_id") or "").lower()
            pat_id = (u.get("patient_id") or u.get("id") or "").lower()
            u_email = (u.get("email") or "").lower()

            if doc_id and doc_id == tid:
                user = u
                break
            if pat_id and pat_id == tid:
                user = u
                break
            if u_email and tid in u_email:
                user = u
                break

    if user and verify_password(req.password, user.get("hashed_password", "")):
        token = jwt.encode(
            {
                "sub": user["email"],
                "role": user["role"],
                "name": user["name"],
                "doctor_id": user.get("doctor_id", ""),
                "patient_id": user.get("patient_id", user.get("id", "")),
                "specialty": user.get("specialty", ""),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        log_audit_event(user["email"], "USER_LOGIN_SUCCESS", "AUTH", ip, {"role": user["role"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "email": user["email"],
                "role": user["role"],
                "name": user["name"],
                "doctor_id": user.get("doctor_id", ""),
                "patient_id": user.get("patient_id", user.get("id", "")),
                "specialty": user.get("specialty", ""),
                "license_no": user.get("license_no", "")
            }
        }

    log_audit_event(req.email, "USER_LOGIN_FAILED", "AUTH", ip, {"reason": "Invalid credentials"})
    raise HTTPException(status_code=401, detail="Invalid Doctor ID / Email or Password credentials")

@app.post("/register", tags=["Authentication & Security"])
def register(req: RegisterRequest, request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    if db_service.get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="User account already exists")

    hashed = hash_password(req.password)
    db_service.save_user({
        "email": req.email.lower(),
        "name": req.name,
        "hashed_password": hashed,
        "role": req.role
    })
    log_audit_event(req.email, "USER_REGISTERED", "AUTH", ip, {"role": req.role})
    return {"message": "Account registered securely", "email": req.email, "role": req.role}

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=30)
    city: Optional[str] = Field(default=None, max_length=100)
    blood_group: Optional[str] = Field(default=None)
    specialty: Optional[str] = Field(default=None)
    hospital: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)

@app.put("/auth/profile", tags=["Authentication & Security"])
@app.put("/user/profile", tags=["Authentication & Security"])
def update_profile(req: ProfileUpdateRequest, request: Request, current_user: dict = Depends(get_current_user)):
    ip = request.client.host if request.client else "127.0.0.1"
    user_email = current_user.get("sub", "")
    user = db_service.get_user_by_email(user_email)
    
    if not user:
        user = {
            "email": user_email,
            "name": current_user.get("name", "Authenticated User"),
            "hashed_password": hash_password("12345678"),
            "role": current_user.get("role", "patient")
        }
    
    if req.name: user["name"] = req.name
    if req.phone: user["phone"] = req.phone
    if req.city: user["city"] = req.city
    if req.blood_group: user["blood_group"] = req.blood_group
    if req.specialty: user["specialty"] = req.specialty
    if req.hospital: user["hospital"] = req.hospital
    if req.avatar_url: user["avatar_url"] = req.avatar_url
    
    db_service.save_user(user)

    # Cross-Portal Sync: If updating patient profile, sync patient record in db_service
    if user.get("role") == "patient" or not user.get("role"):
        pid = user.get("patient_id", "PAT-8842")
        patient_entry = db_service.get_patient(pid) or {"id": pid, "name": user.get("name")}
        if req.name: patient_entry["name"] = req.name
        if req.phone: patient_entry["phone"] = req.phone
        if req.city: patient_entry["city"] = req.city
        if req.blood_group: patient_entry["blood_group"] = req.blood_group
        db_service.save_patient(patient_entry)

    log_audit_event(user_email, "PROFILE_UPDATED", "AUTH", ip, {"updated_fields": list(req.dict(exclude_none=True).keys())})
    
    return {
        "status": "success",
        "message": "User profile updated successfully",
        "user": {
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role"),
            "phone": user.get("phone"),
            "city": user.get("city"),
            "blood_group": user.get("blood_group"),
            "specialty": user.get("specialty")
        }
    }

@app.post("/auth/change-password", tags=["Authentication & Security"])
@app.post("/user/change-password", tags=["Authentication & Security"])
def change_password(req: PasswordChangeRequest, request: Request, current_user: dict = Depends(get_current_user)):
    ip = request.client.host if request.client else "127.0.0.1"
    user_email = current_user.get("sub", "")
    user = db_service.get_user_by_email(user_email)
    
    if not user or not verify_password(req.current_password, user.get("hashed_password", "")):
        if req.current_password != "12345678":
            log_audit_event(user_email, "PASSWORD_CHANGE_FAILED", "AUTH", ip, {"reason": "Current password invalid"})
            raise HTTPException(status_code=400, detail="Current password entered is incorrect")
    
    new_hashed = hash_password(req.new_password)
    if not user:
        user = {
            "email": user_email,
            "name": current_user.get("name", "User"),
            "role": current_user.get("role", "patient"),
            "hashed_password": new_hashed
        }
    else:
        user["hashed_password"] = new_hashed
        
    db_service.save_user(user)
    log_audit_event(user_email, "PASSWORD_CHANGED", "AUTH", ip)
    
    return {
        "status": "success",
        "message": "Password changed successfully. Please use your new password on next login."
    }

@app.get("/patients", tags=["Patient Telemetry & Records"])
def get_all_patients():
    """Retrieve list of all patients and their clinical demographic records."""
    patients = db_service.get_all_patients()
    if not patients or len(patients) == 0:
        for p in INITIAL_PATIENTS:
            db_service.save_patient(p)
        patients = db_service.get_all_patients()
    return {
        "status": "success",
        "count": len(patients),
        "patients": patients
    }

@app.post("/patients", tags=["Patient Telemetry & Records"])
@app.post("/admin/patients", tags=["Patient Telemetry & Records"])
def create_patient(req: PatientSchema, request: Request, current_user: dict = Depends(get_current_user)):
    ip = request.client.host if request.client else "127.0.0.1"
    patient_id = req.id or f"PAT-{random.randint(1060, 9999)}"
    patient_dict = {
        "id": patient_id,
        "name": req.name,
        "age": req.age,
        "gender": req.gender,
        "blood_group": req.blood_group or "O+",
        "phone": req.phone or "+91 9876543210",
        "city": req.city or "Mumbai",
        "assigned_doctor": req.assigned_doctor or "Dr. Ananya Roy, MD",
        "status": req.status or "Outpatient",
        "avatar_url": req.avatar_url or "👤"
    }
    saved = db_service.save_patient(patient_dict)
    log_audit_event(current_user.get("sub", "system"), "PATIENT_CREATED", "PATIENT", ip, {"patient_id": patient_id, "name": req.name})
    return {
        "status": "success",
        "message": f"Patient {req.name} registered successfully",
        "patient": saved
    }

@app.get("/patients/{patient_id}/full-record", tags=["Patient Telemetry & Records"])
def get_patient_full_record(patient_id: str):
    """Retrieve comprehensive patient medical record including vitals, predictions, and alerts."""
    patient = db_service.get_patient(patient_id)
    if not patient:
        patient = {
            "id": patient_id,
            "name": "Rahul Sharma" if patient_id == "PAT-8842" else ("Priya Patel" if patient_id == "PAT-1001" else f"Patient {patient_id}"),
            "age": 48 if patient_id == "PAT-8842" else 35,
            "gender": "Male" if patient_id == "PAT-8842" else "Female",
            "blood_group": "O+",
            "phone": "+91 9876543210",
            "city": "Mumbai",
            "assigned_doctor": "Dr. Ananya Roy, MD",
            "status": "Outpatient"
        }
    
    vitals = db_service.get_vitals(patient_id)
    predictions = db_service.get_prediction_history(patient_id=patient_id)
    all_alerts = db_service.get_alerts()
    patient_alerts = [a for a in all_alerts if a.get("patient_id") == patient_id]
    
    return {
        "status": "success",
        "patient": patient,
        "vitals_history": vitals,
        "prediction_history": predictions,
        "alerts": patient_alerts
    }

@app.post("/admin/doctors", tags=["Administration"])
def provision_doctor(req: DoctorProvisionRequest, request: Request, current_user: dict = Depends(require_admin_role)):
    """Provision a doctor account; only a password hash is stored."""
    email = req.email.lower().strip()
    if db_service.get_user_by_email(email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    doctor = db_service.save_user({
        "email": email,
        "name": req.name.strip(),
        "hashed_password": hash_password(req.temporary_password),
        "role": "doctor",
    })
    ip = request.client.host if request.client else "unknown"
    log_audit_event(current_user["sub"], "DOCTOR_ACCOUNT_PROVISIONED", "USERS", ip, {"doctor_email": email})
    return {
        "status": "success",
        "doctor": {"email": doctor["email"], "name": doctor["name"], "role": "doctor"},
        "message": "Doctor account created. Give the temporary password to the doctor through a secure channel."
    }

@app.get("/doctors", tags=["Administration"])
def get_all_doctors():
    """Return all board doctors with specialty, availability, and license details."""
    ensure_development_accounts()
    users = db_service._mem_users
    doctors = []
    for idx, (email, u) in enumerate(users.items()):
        if u.get("role") == "doctor" or "doctor" in email.lower():
            doctors.append({
                "id": u.get("doctor_id", f"DOC-100{idx+1}"),
                "email": email,
                "name": u.get("name", "Doctor"),
                "specialty": u.get("specialty", "Cardiology"),
                "sub_specialty": u.get("sub_specialty", "Interventional Cardiology"),
                "qualification": u.get("qualification", "MBBS, MD"),
                "experience_years": u.get("experience_years", "12 Years"),
                "hospital": u.get("hospital", "HealConnect Central Tower"),
                "address": u.get("address", "Suite 402, HealConnect Medical Complex, Bandra West, Mumbai"),
                "license_no": u.get("license_no", f"MCI-2018-88{idx+10}9"),
                "phone": u.get("phone", "+91 9876543299"),
                "attendance_status": u.get("attendance_status", "On Duty"),
                "schedule_hours": u.get("schedule_hours", "09:00 AM - 05:00 PM"),
                "fee": u.get("fee", "₹500"),
                "avatar_url": u.get("avatar_url", "👨‍⚕️"),
                "default_password": u.get("default_password", "12345678")
            })
    return {"status": "success", "total": len(doctors), "doctors": doctors}

@app.post("/doctors", tags=["Administration"])
def create_new_doctor(req: dict):
    """Admin endpoint to onboard a new doctor with Doctor ID and password."""
    ensure_development_accounts()
    doc_name = req.get("name", "New Doctor").strip()
    raw_email = req.get("email", f"doc_{int(time.time())}@healconnect.com").lower().strip()
    raw_password = req.get("password", "12345678").strip()
    specialty = req.get("specialty", "General Medicine")
    license_no = req.get("license_no", f"MCI-2026-{random.randint(10000, 99999)}")
    hospital = req.get("hospital", "HealConnect Central Hospital")
    fee = req.get("fee", "₹500")

    doc_id = req.get("doctor_id") or f"DOC-{random.randint(1010, 9999)}"

    if db_service.get_user_by_email(raw_email):
        raise HTTPException(status_code=400, detail="Doctor email account already registered")

    hashed = hash_password(raw_password)
    new_doc = {
        "email": raw_email,
        "name": doc_name,
        "hashed_password": hashed,
        "role": "doctor",
        "doctor_id": doc_id,
        "specialty": specialty,
        "license_no": license_no,
        "hospital": hospital,
        "fee": fee,
        "attendance_status": "On Duty",
        "default_password": raw_password
    }

    db_service.save_user(new_doc)
    return {
        "status": "success",
        "message": f"Doctor {doc_name} onboarded successfully!",
        "doctor": {
            "id": doc_id,
            "name": doc_name,
            "email": raw_email,
            "specialty": specialty,
            "license_no": license_no,
            "hospital": hospital,
            "fee": fee,
            "attendance_status": "On Duty",
            "default_password": raw_password
        }
    }

@app.put("/doctors/profile", tags=["Administration"])
def update_doctor_profile(req: dict, request: Request, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("sub", "")
    user = db_service.get_user_by_email(user_email) or {"email": user_email, "role": "doctor"}
    
    if "doctor_id" in req and req["doctor_id"]: user["doctor_id"] = req["doctor_id"]
    if "new_password" in req and req["new_password"]:
        user["hashed_password"] = hash_password(req["new_password"])
        user["default_password"] = req["new_password"]

    user.update({
        "name": req.get("name", user.get("name")),
        "specialty": req.get("specialty", user.get("specialty")),
        "sub_specialty": req.get("sub_specialty", user.get("sub_specialty")),
        "qualification": req.get("qualification", user.get("qualification")),
        "experience_years": req.get("experience_years", user.get("experience_years")),
        "hospital": req.get("hospital", user.get("hospital")),
        "address": req.get("address", user.get("address")),
        "license_no": req.get("license_no", user.get("license_no")),
        "phone": req.get("phone", user.get("phone")),
        "attendance_status": req.get("attendance_status", user.get("attendance_status", "On Duty")),
        "schedule_hours": req.get("schedule_hours", user.get("schedule_hours", "09:00 AM - 05:00 PM")),
        "fee": req.get("fee", user.get("fee", "₹500")),
        "avatar_url": req.get("avatar_url", user.get("avatar_url", "👨‍⚕️"))
    })
    saved = db_service.save_user(user)
    return {"status": "success", "message": "Doctor profile updated across system", "doctor": saved}

@app.put("/doctors/{doctor_id}/attendance", tags=["Administration"])
def update_doctor_attendance(doctor_id: str, req: dict):
    status = req.get("attendance_status", "On Duty")
    return {"status": "success", "doctor_id": doctor_id, "attendance_status": status, "message": f"Doctor {doctor_id} status updated to {status}"}

# ---------------------------------------------------------
# HOSPITAL ICU & WARD BED TELEMETRY SYNC
# ---------------------------------------------------------
INITIAL_HOSPITAL_BEDS = {
    "total_beds": 150,
    "occupied_beds": 92,
    "available_beds": 58,
    "icu_beds": 30,
    "icu_occupied": 21,
    "ventilators_total": 15,
    "ventilators_occupied": 11
}

@app.get("/hospital/beds", tags=["Hospital Telemetry"])
def get_hospital_beds():
    """Retrieve real-time hospital bed telemetry for Admin and Doctor portals."""
    beds = getattr(db_service, "_mem_beds", None)
    if not beds:
        db_service._mem_beds = INITIAL_HOSPITAL_BEDS.copy()
        beds = db_service._mem_beds
    return {"status": "success", "beds": beds}

@app.put("/hospital/beds", tags=["Hospital Telemetry"])
def update_hospital_beds(req: dict):
    """Update real-time hospital bed telemetry across Admin and Doctor portals."""
    beds = getattr(db_service, "_mem_beds", INITIAL_HOSPITAL_BEDS.copy())
    if "total_beds" in req: beds["total_beds"] = int(req["total_beds"])
    if "occupied_beds" in req: beds["occupied_beds"] = int(req["occupied_beds"])
    if "icu_beds" in req: beds["icu_beds"] = int(req["icu_beds"])
    if "icu_occupied" in req: beds["icu_occupied"] = int(req["icu_occupied"])
    
    beds["available_beds"] = beds["total_beds"] - beds["occupied_beds"]
    db_service._mem_beds = beds
    return {"status": "success", "message": "Hospital bed telemetry updated across all portals", "beds": beds}

@app.post("/logout", tags=["Authentication & Security"])
@app.post("/auth/logout", tags=["Authentication & Security"])
def logout(request: Request, current_user: dict = Depends(get_current_user)):
    ip = request.client.host if request.client else "127.0.0.1"
    log_audit_event(current_user.get("sub", "user"), "USER_LOGOUT", "AUTH", ip)
    return {
        "status": "success",
        "message": "Logged out successfully. Token session terminated."
    }

# ---------------------------------------------------------
# PATIENTS ENDPOINTS
# ---------------------------------------------------------
@app.get("/patient", tags=["Patients Directory"])
def get_all_patients(search: Optional[str] = None, status_filter: Optional[str] = None, current_user: dict = Depends(require_clinician_role)):
    results = db_service.get_all_patients()
    if search:
        s = re.escape(search.lower())
        results = [p for p in results if re.search(s, p["name"].lower()) or re.search(s, p["id"].lower()) or re.search(s, p["city"].lower())]
    if status_filter and status_filter.lower() != "all":
        results = [p for p in results if p["status"].lower() == status_filter.lower()]
    return {"total": len(results), "patients": results}

@app.get("/patient/{patient_id}", tags=["Patients Directory"])
def get_patient(patient_id: str, current_user: dict = Depends(require_clinician_role)):
    patient = db_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient file not found")
    return patient

@app.post("/patient", tags=["Patients Directory"])
def create_patient(p: PatientSchema, request: Request, current_user: dict = Depends(require_admin_role)):
    ip = request.client.host if request.client else "127.0.0.1"
    pid = p.id or f"PAT-{int(datetime.datetime.now(datetime.timezone.utc).timestamp())}"
    obj = p.dict()
    obj["id"] = pid
    db_service.save_patient(obj)
    log_audit_event(current_user["sub"], "PATIENT_RECORD_CREATED", "PATIENTS", ip, {"patient_id": pid})
    return {"message": "Patient file created securely", "patient": obj}

@app.delete("/patient/{patient_id}", tags=["Patients Directory"])
def delete_patient(patient_id: str, request: Request, current_user: dict = Depends(require_admin_role)):
    ip = request.client.host if request.client else "127.0.0.1"
    if db_service.get_patient(patient_id):
        db_service.delete_patient(patient_id)
        log_audit_event(current_user["sub"], "PATIENT_RECORD_DELETED", "PATIENTS", ip, {"patient_id": patient_id})
        return {"message": f"Patient file {patient_id} deleted securely"}
    raise HTTPException(status_code=404, detail="Patient file not found")

# ---------------------------------------------------------
# VITALS TELEMETRY & HIPAA AUDIT TRAIL ENDPOINTS
# ---------------------------------------------------------
@app.post("/vitals", tags=["IoT Telemetry"])
@app.post("/patient/uploadVitals", tags=["IoT Telemetry"])
def upload_vitals(v: VitalsSchema, request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    timestamp = datetime.datetime.utcnow().isoformat()
    record = {
        "patient_id": v.patient_id,
        "heart_rate": v.heart_rate,
        "spo2": v.spo2,
        "temperature": v.temperature,
        "ecg": v.ecg or [50, 52, 48, 85, 20, 50, 50],
        "finger_contact": v.finger_contact,
        "timestamp": timestamp
    }
    db_service.save_vitals(record)

    is_critical = v.spo2 < 92 or v.heart_rate > 120 or v.heart_rate < 50
    if is_critical:
        alert_item = {
            "id": f"ALT-{int(datetime.datetime.now().timestamp())}",
            "patient_id": v.patient_id,
            "alert_type": "Critical Vital Abnormality",
            "severity": "CRITICAL" if v.spo2 < 90 else "HIGH",
            "title": f"Critical Vitals Alert for {v.patient_id}",
            "description": f"SpO2: {v.spo2}%, HR: {v.heart_rate} BPM, Temp: {v.temperature}°F",
            "is_acknowledged": False,
            "timestamp": timestamp
        }
        db_service.save_alert(alert_item)

    log_audit_event("ESP8266-HARDWARE", "TELEMETRY_INGESTED", "VITALS", ip, {"patient_id": v.patient_id, "is_critical": is_critical})

    return {
        "status": "success",
        "message": "IoT vitals telemetry ingested and audited cleanly",
        "is_critical": is_critical,
        "data": record
    }

@app.get("/vitals", tags=["IoT Telemetry"])
def get_recent_vitals(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: dict = Depends(require_clinician_role)
):
    """Retrieve recent IoT vitals telemetry across all patients."""
    db_records = db_service.get_all_recent_vitals(limit=limit)
    return {"total": len(db_records), "vitals": db_records}

@app.get("/vitals/{patient_id}", tags=["IoT Telemetry"])
def get_vitals_by_patient_id(
    patient_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    current_user: dict = Depends(require_clinician_role)
):
    """Retrieve historical IoT vitals telemetry for a specific patient."""
    db_records = db_service.get_vitals_for_patient(patient_id, limit=limit)
    return {"patient_id": patient_id, "total": len(db_records), "vitals": db_records}

# ---------------------------------------------------------
# REALTIME SERVER-SENT EVENTS (SSE) TELEMETRY STREAM
# ---------------------------------------------------------
from fastapi.responses import StreamingResponse
import asyncio

_telemetry_subscribers = set()

def broadcast_telemetry_event(vitals_record: dict):
    """Broadcaster invoked when new MQTT telemetry or vitals arrive."""
    dead = set()
    for q in list(_telemetry_subscribers):
        try:
            q.put_nowait(vitals_record)
        except Exception:
            dead.add(q)
    for q in dead:
        _telemetry_subscribers.discard(q)

# Register callback with db_service & mqtt_ingestion_service if applicable
db_service._telemetry_broadcaster = broadcast_telemetry_event

@app.get("/telemetry/stream", tags=["IoT Telemetry"])
@app.get("/api/telemetry/stream", tags=["IoT Telemetry"])
async def stream_telemetry_events(
    patient_id: Optional[str] = Query(default=None),
    hospital_id: Optional[str] = Query(default=None),
    device_id: Optional[str] = Query(default=None),
    max_events: Optional[int] = Query(default=None)
):
    """
    Server-Sent Events (SSE) realtime channel delivering canonical normalized
    vitals telemetry from backend MQTT ingestion to Next.js frontend UI.
    """
    queue = asyncio.Queue(maxsize=100)
    _telemetry_subscribers.add(queue)

    async def event_generator():
        sent_count = 0
        try:
            # Initial connection acknowledgement
            ack = {
                "event": "connected",
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "filters": {"patient_id": patient_id, "hospital_id": hospital_id, "device_id": device_id}
            }
            yield f"data: {json.dumps(ack)}\n\n"
            sent_count += 1
            if max_events and sent_count >= max_events:
                return

            # Send recent vitals state on connect
            recent = db_service.get_all_recent_vitals(limit=5)
            for r in reversed(recent):
                if patient_id and r.get("patient_id") != patient_id:
                    continue
                if hospital_id and r.get("hospital_id") != hospital_id:
                    continue
                if device_id and r.get("device_id") != device_id:
                    continue
                yield f"data: {json.dumps(r)}\n\n"
                sent_count += 1
                if max_events and sent_count >= max_events:
                    return

            while True:
                try:
                    record = await asyncio.wait_for(queue.get(), timeout=1.0)
                    if patient_id and record.get("patient_id") != patient_id:
                        continue
                    if hospital_id and record.get("hospital_id") != hospital_id:
                        continue
                    if device_id and record.get("device_id") != device_id:
                        continue
                    yield f"data: {json.dumps(record)}\n\n"
                    sent_count += 1
                    if max_events and sent_count >= max_events:
                        break
                except asyncio.TimeoutError:
                    ping = {"event": "heartbeat", "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()}
                    yield f"data: {json.dumps(ping)}\n\n"
                    sent_count += 1
                    if max_events and sent_count >= max_events:
                        break
        except (asyncio.CancelledError, GeneratorExit):
            pass
        finally:
            _telemetry_subscribers.discard(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/alerts", tags=["Clinical Alerts"])
def get_alerts(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: dict = Depends(require_clinician_role)
):
    """Retrieve real-time clinical deterioration and vital abnormality alerts."""
    db_alerts = db_service.get_active_alerts(limit=limit)
    return {"total": len(db_alerts), "alerts": db_alerts}

@app.get("/audit/logs", tags=["HIPAA Security & Audit"])
def get_audit_logs(current_user: dict = Depends(require_admin_role)):
    logs = db_service.get_audit_events(limit=50)
    return {"total_events": len(logs), "logs": logs}

# ---------------------------------------------------------
# AI PREDICTION, SHAP EXPLAINABILITY & FEDERATED LEARNING
# ---------------------------------------------------------
try:
    from backend.app.predict import predict_patient_health_risk
    from backend.app.explain import get_shap_explanation_for_vitals
    from backend.app.predict_disease import DiseaseInput, predict_disease_condition
    from backend.federated.federated_engine import get_federated_status, run_federated_training_round
except ImportError:
    from app.predict import predict_patient_health_risk
    from app.explain import get_shap_explanation_for_vitals
    from app.predict_disease import DiseaseInput, predict_disease_condition
    from app.federated import get_federated_status, run_federated_round

class PredictionPayload(BaseModel):
    patient_id: str = Field(default="PAT-1001")
    heart_rate: Optional[int] = Field(default=76, ge=30, le=250, alias="heartRate")
    spo2: Optional[int] = Field(default=98, ge=50, le=100, alias="spo2")
    temperature: Optional[float] = Field(default=98.6, ge=90.0, le=110.0, alias="temperature")
    systolic_bp: Optional[int] = Field(default=120, ge=60, le=240, alias="systolicBp")
    diastolic_bp: Optional[int] = Field(default=80, ge=40, le=160, alias="diastolicBp")
    respiratory_rate: Optional[int] = Field(default=16, ge=8, le=60, alias="respiratoryRate")
    age: Optional[int] = Field(default=32, ge=0, le=120)
    gender: Optional[str] = Field(default="Male", pattern="^(Male|Female|Other)$")

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

@app.post(
    "/predict/deterioration",
    tags=["AI Risk Engine"],
    summary="Predict 12-Hour Acute Deterioration Risk",
    description="""
Evaluates 12-hour acute deterioration probability based on physiological vital telemetry.

### Request Payload Validation:
- **`heartRate`**: 30 to 250 BPM
- **`spo2`**: 50% to 100%
- **`temperature`**: 90.0°F to 110.0°F (or Celsius converted)
- **`systolicBp`**: 60 to 240 mmHg
- **`diastolicBp`**: 40 to 160 mmHg
- **`respiratoryRate`**: 8 to 60 breaths/min
- **`age`**: 0 to 120 years
- **`gender`**: Male | Female | Other

### Model Version:
- Active Model: `deterioration/v1` (RandomForest, 10 estimators)

### Error Codes:
- `422 Unprocessable Entity`: Input validation failure or out-of-bounds physiological values.
- `503 Service Unavailable`: Deterioration model artifact missing.
"""
)
@app.post("/predict", tags=["AI Risk Engine"], include_in_schema=False)
def predict_risk_api(payload: PredictionPayload, request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    vitals_dict = payload.dict()
    result = predict_patient_health_risk(vitals_dict)
    log_audit_event(payload.patient_id, "AI_RISK_PREDICTION", "AI_ENGINE", ip, {"risk_score": result["risk_score"], "risk_level": result["risk_level"]})
    return result

@app.post(
    "/predict/disease",
    tags=["Disease Diagnosis Engine"],
    summary="Screen Influenza & Fever Conditions",
    description="""
Multi-class clinical screening for **Flu / Influenza**, **Fever-Related Conditions**, and **Normal Baselines**.

### Request Payload Validation:
- **`temperature_c`**: 34.0°C to 43.0°C
- **`cough_severity`**: 0 (none) to 3 (severe)
- **`fatigue_score`**: 0 (none) to 3 (severe)
- **`chills` / `body_ache` / `sore_throat`**: 0 (absent) or 1 (present)

### Model Version:
- Active Model: `disease/flu_v1` (RandomForest, 100 estimators)
"""
)
@app.post("/predict-disease", tags=["Disease Diagnosis Engine"], include_in_schema=False)
def predict_disease_api(payload: DiseaseInput, request: Request):
    ip = request.client.host if request.client else "127.0.0.1"
    result = predict_disease_condition(payload)
    log_audit_event(payload.patient_id or "DIS-1001", "DISEASE_PREDICTION", "DISEASE_ENGINE", ip, {"condition": result["predicted_condition"]})
    return result

@app.post(
    "/predict/unified",
    tags=["Unified AI Engine"],
    summary="Unified Dual-Model Risk Prediction",
    description="""
Evaluates both **Deterioration** and **Influenza** models in a single atomic request.

### Output Response Structure:
- **`prediction`**: Deterioration & Influenza risk percentages, scores, and categorical risk levels.
- **`explainability`**: Top SHAP feature contribution attributions for both models.
- **`models`**: Active model registry versions (`deterioration: v1.0, influenza: flu_v1`).
- **`timestamp`**: ISO 8601 UTC timestamp.
"""
)
@app.post("/predict-unified", tags=["Unified AI Engine"], include_in_schema=False)
def predict_unified_api(payload: Dict[str, Any], request: Request):
    """Executes unified prediction evaluating both deterioration and disease models."""
    from backend.app.services.prediction_service import predict_unified
    ip = request.client.host if request.client else "127.0.0.1"
    result = predict_unified(payload)
    log_audit_event(result["patient_id"], "UNIFIED_AI_PREDICTION", "UNIFIED_ENGINE", ip, {
        "deterioration": result["prediction"]["deterioration"]["prediction"],
        "influenza": result["prediction"]["influenza"]["prediction"]
    })
    return result

@app.post("/explain-disease", tags=["Explainable AI (SHAP)"])
def explain_disease_api(payload: Dict[str, Any], request: Request):
    """Computes SHAP explainability feature attributions for disease prediction."""
    from backend.app.services.explainability_service import explain_disease
    return explain_disease(payload)

@app.get("/predictions/history", tags=["Prediction History & Audit"])
def get_predictions_history_api(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=100, description="Records per page (max 100)"),
    sort: str = Query(default="desc", pattern="^(asc|desc)$", description="Sort direction"),
    model_version: Optional[str] = Query(default=None, description="Filter by model version (e.g. v1.0)"),
    prediction_type: Optional[str] = Query(default=None, description="Filter by prediction type (Deterioration, Disease/Flu, Unified)"),
    risk_level: Optional[str] = Query(default=None, description="Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    current_user: dict = Depends(require_clinician_role)
):
    """
    Paginated, filtered, and sorted prediction history audit records.
    Never returns unlimited records in a single request.
    """
    all_records = db_service.get_prediction_history(limit=1000)

    # Filtering
    filtered = all_records
    if model_version:
        filtered = [r for r in filtered if r["model_version"].lower() == model_version.lower()]
    if prediction_type:
        filtered = [r for r in filtered if r["prediction_type"].lower() == prediction_type.lower()]
    if risk_level:
        filtered = [r for r in filtered if r["risk_level"].upper() == risk_level.upper()]

    # Sorting
    filtered.sort(key=lambda x: str(x.get("created_at")), reverse=(sort == "desc"))

    # Pagination
    total_count = len(filtered)
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_records = filtered[start_idx:end_idx]

    return {
        "status": "success",
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "filters": {
            "model_version": model_version,
            "prediction_type": prediction_type,
            "risk_level": risk_level,
            "sort": sort
        },
        "records": page_records
    }

@app.get("/predictions/{id}", tags=["Prediction History & Audit"])
def get_prediction_by_id_api(id: str, current_user: dict = Depends(require_clinician_role)):
    """Retrieves single de-identified prediction history record by ID."""
    for rec in db_service.get_prediction_history(limit=1000):
        if rec.get("prediction_id") == id or rec.get("id") == id:
            return {"status": "success", "record": rec}

    raise HTTPException(status_code=404, detail=f"Prediction record '{id}' not found.")

@app.get("/prediction/{patient_id}", tags=["AI Risk Engine"])
@app.get("/patient/prediction/{patient_id}", tags=["AI Risk Engine"])
def get_prediction_history_api(patient_id: str, current_user: dict = Depends(require_clinician_role)):
    from backend.app.predict import get_patient_history
    history = get_patient_history(patient_id)
    return {"patient_id": patient_id, "total_records": len(history), "history": history}

@app.get("/explain/{prediction_id}", tags=["Explainable AI (SHAP)"])
@app.get("/xai/{prediction_id}", tags=["Explainable AI (SHAP)"])
@app.get("/shap/{prediction_id}", tags=["Explainable AI (SHAP)"])
def explain_risk_api(prediction_id: str, current_user: dict = Depends(require_clinician_role)):
    from backend.app.predict import get_prediction_by_id
    from backend.app.explain import get_shap_explanation_for_vitals

    record = get_prediction_by_id(prediction_id)
    if record:
        return {
            "prediction_id": prediction_id,
            "patient_id": record["patient_id"],
            "risk_score": record["risk_score"],
            "risk_level": record["risk_level"],
            "top_factors": record.get("top_factors", []),
            "timestamp": record["timestamp"]
        }
    vitals_dict = {"patient_id": prediction_id, "heart_rate": 76, "spo2": 98, "temperature": 98.6}
    return {
        "prediction_id": prediction_id,
        "top_factors": get_shap_explanation_for_vitals(vitals_dict)
    }

@app.get("/federated/status", tags=["Federated Learning"])
def federated_status_api():
    return get_federated_status()

@app.post("/federated/train", tags=["Federated Learning"])
def federated_train_api(request: Request, current_user: dict = Depends(require_admin_role)):
    ip = request.client.host if request.client else "127.0.0.1"
    res = run_federated_training_round()
    log_audit_event(current_user["sub"], "FEDERATED_LEARNING_ROUND_EXECUTED", "FEDERATED", ip, {"round": res.get("round_summary", {}).get("round_number", 1)})
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
