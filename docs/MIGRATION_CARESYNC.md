# CareSync Database & System Migration Guide

> **Notice**: This migration guide provides the SQL statements required to update live Supabase/PostgreSQL user tables when migrating from `healconnect` domain emails to `caresync` domain emails.

---

## 🗄️ SQL Data Migration Script

To update existing user accounts in your live Supabase instance without dropping patient history, execute the following SQL in your Supabase SQL Editor:

```sql
-- 1. Update Supabase Auth Users
UPDATE auth.users 
SET email = REPLACE(email, '@healconnect.com', '@caresync.com') 
WHERE email LIKE '%@healconnect.com';

-- 2. Update Application Users Table
UPDATE public.users 
SET email = REPLACE(email, '@healconnect.com', '@caresync.com') 
WHERE email LIKE '%@healconnect.com';

-- 3. Update Doctor Profiles
UPDATE public.doctors 
SET email = REPLACE(email, '@healconnect.com', '@caresync.com') 
WHERE email LIKE '%@healconnect.com';

-- 4. Update Patient Profiles
UPDATE public.patients 
SET email = REPLACE(email, '@healconnect.com', '@caresync.com') 
WHERE email LIKE '%@healconnect.com';
```

---

## 📡 Broker & Firmware Migration

1. **Mosquitto MQTT Broker**:  
   After updating `mosquitto/config/mosquitto.acl`, restart the Mosquitto broker service so the new topic ACL pattern (`caresync/#`) takes effect.
   ```bash
   docker-compose restart broker
   # or
   systemctl restart mosquitto
   ```

2. **ESP8266 Hardware Firmware**:  
   Re-flash edge ESP8266 microcontrollers with the updated firmware from `CareSync_Kit_ESP8266_Code/` so that sensors publish vitals under the `caresync/{hospital_id}/{device_id}/vitals` topic prefix.
