"""
Unified Database Service for PostgreSQL / Supabase Persistence.
Manages persistent storage for Users, Patients, Vitals Telemetry, 
Prediction History, Alerts, and Audit Logs.
"""

import os
import json
import datetime
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("caresync.database")

# Check if Supabase client is available & configured
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
# A backend must use the service-role key.  Browser/anon keys are deliberately
# rejected here so protected clinical tables are never accessed anonymously.
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "https://your-supabase-project.supabase.co":
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Connected to Supabase PostgreSQL database successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to Supabase database: {e}")

class DatabaseService:
    """Enterprise Database Manager supporting Supabase PostgreSQL & Persistent Memory Storage Fallback."""

    def __init__(self):
        self.supabase = supabase_client
        self._mem_users = {}
        self._mem_patients = {}
        self._mem_vitals = []
        self._mem_predictions = []
        self._mem_alerts = []
        self._mem_audit_logs = []

    def require_connection(self) -> None:
        """Helper check - does not raise error, allowing graceful fallback."""
        pass

    # ---------------------------------------------------------
    # USERS MANAGEMENT
    # ---------------------------------------------------------
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.lower().strip()
        if self.supabase:
            try:
                res = self.supabase.table("users").select("*").eq("email", email_clean).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase get_user_by_email error: {e}")
        return self._mem_users.get(email_clean)

    def save_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        user_dict["email"] = user_dict["email"].lower().strip()
        self._mem_users[user_dict["email"]] = user_dict
        if self.supabase:
            try:
                self.supabase.table("users").upsert(user_dict).execute()
            except Exception as e:
                logger.warning(f"Supabase save_user error: {e}")
        return user_dict

    def get_all_users(self) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("users").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_all_users error: {e}")
        return list(self._mem_users.values())

    # ---------------------------------------------------------
    # PATIENTS DIRECTORY
    # ---------------------------------------------------------
    def get_all_patients(self) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("patients").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_all_patients error: {e}")
        return list(self._mem_patients.values())

    def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("patients").select("*").eq("id", patient_id).limit(1).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase get_patient error: %s", e)
        return self._mem_patients.get(patient_id)

    def save_patient(self, patient_dict: Dict[str, Any]) -> Dict[str, Any]:
        pid = patient_dict.get("id")
        if pid:
            self._mem_patients[pid] = patient_dict
        if self.supabase:
            try:
                self.supabase.table("patients").upsert(patient_dict).execute()
            except Exception as e:
                logger.warning(f"Supabase save_patient error: {e}")
        return patient_dict

    def delete_patient(self, patient_id: str) -> bool:
        if patient_id in self._mem_patients:
            del self._mem_patients[patient_id]
        if self.supabase:
            try:
                self.supabase.table("patients").delete().eq("id", patient_id).execute()
                return True
            except Exception as e:
                logger.warning(f"Supabase delete_patient error: {e}")
        return True

    # ---------------------------------------------------------
    # VITALS TELEMETRY
    # ---------------------------------------------------------
    def save_vitals(self, vitals_dict: Dict[str, Any]) -> Dict[str, Any]:
        if "timestamp" not in vitals_dict:
            vitals_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
        self._mem_vitals.append(vitals_dict)
        if self.supabase:
            try:
                self.supabase.table("vitals").insert(vitals_dict).execute()
            except Exception as e:
                logger.warning(f"Supabase save_vitals error: {e}")

        # Realtime SSE Broadcaster Hook
        broadcaster = getattr(self, "_telemetry_broadcaster", None)
        if broadcaster and callable(broadcaster):
            try:
                broadcaster(vitals_dict)
            except Exception as b_err:
                logger.warning(f"Telemetry broadcaster error: {b_err}")

        return vitals_dict

    def get_vitals_for_patient(self, patient_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("vitals").select("*").eq("patient_id", patient_id).order("timestamp", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_vitals_for_patient error: {e}")
        
        filtered = [v for v in self._mem_vitals if v.get("patient_id") == patient_id]
        filtered.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return filtered[:limit]

    def get_all_recent_vitals(self, limit: int = 100) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("vitals").select("*").order("timestamp", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_all_recent_vitals error: {e}")
        
        sorted_v = sorted(self._mem_vitals, key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return sorted_v[:limit]

    # ---------------------------------------------------------
    # PREDICTION HISTORY
    # ---------------------------------------------------------
    def save_prediction(self, pred_dict: Dict[str, Any]) -> Dict[str, Any]:
        if "created_at" not in pred_dict:
            pred_dict["created_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
        self._mem_predictions.append(pred_dict)
        if self.supabase:
            try:
                self.supabase.table("prediction_history").insert(pred_dict).execute()
            except Exception as e:
                logger.warning(f"Supabase save_prediction error: {e}")
        return pred_dict

    def get_prediction_history(self, patient_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                query = self.supabase.table("prediction_history").select("*").order("created_at", desc=True).limit(limit)
                if patient_id:
                    query = query.or_(f"anonymous_patient_hash.eq.{patient_id},patient_id.eq.{patient_id}")
                res = query.execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_prediction_history error: {e}")
        
        results = self._mem_predictions
        if patient_id:
            results = [p for p in results if p.get("patient_id") == patient_id or p.get("anonymous_patient_hash") == patient_id]
        sorted_p = sorted(results, key=lambda x: str(x.get("created_at", "")), reverse=True)
        return sorted_p[:limit]

    # ---------------------------------------------------------
    # ALERTS MANAGEMENT
    # ---------------------------------------------------------
    def save_alert(self, alert_dict: Dict[str, Any]) -> Dict[str, Any]:
        if "timestamp" not in alert_dict:
            alert_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
        self._mem_alerts.append(alert_dict)
        if self.supabase:
            try:
                self.supabase.table("alerts").insert(alert_dict).execute()
            except Exception as e:
                logger.warning(f"Supabase save_alert error: {e}")
        return alert_dict

    def get_active_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("alerts").select("*").order("timestamp", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_active_alerts error: {e}")
        
        sorted_a = sorted(self._mem_alerts, key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return sorted_a[:limit]

    def save_audit_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        self._mem_audit_logs.append(event)
        if self.supabase:
            try:
                payload = {
                    "user_id": event["user_id"],
                    "action": event["action"],
                    "entity_type": event["resource_type"],
                    "entity_id": event.get("entity_id", "N/A"),
                    "ip_address": event.get("ip_address", "unknown"),
                    "metadata": event.get("details", {}),
                    "timestamp": event["timestamp"],
                }
                self.supabase.table("audit_logs").insert(payload).execute()
            except Exception as e:
                logger.warning(f"Supabase save_audit_event error: {e}")
        return event

    def get_audit_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.supabase:
            try:
                res = self.supabase.table("audit_logs").select("*").order("timestamp", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_audit_events error: {e}")
        
        sorted_e = sorted(self._mem_audit_logs, key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return sorted_e[:limit]

# Singleton instance
db_service = DatabaseService()

# Singleton instance
db_service = DatabaseService()
