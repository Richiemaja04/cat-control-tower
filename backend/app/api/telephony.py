import os
import urllib.parse
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Asset, EventLog
from app.api.websocket import manager as ws_manager
from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse

router = APIRouter(prefix="/telephony", tags=["Telephony"])

# ── Twilio credentials (set via environment variables — never hardcode) ────────
TWILIO_ACCOUNT_SID   = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN    = os.getenv("TWILIO_AUTH_TOKEN",  "")
TWILIO_FROM_NUMBER   = os.getenv("TWILIO_FROM_NUMBER", "")
DEFAULT_DRIVER_PHONE = os.getenv("DEFAULT_DRIVER_PHONE", "")

# ── In-memory map: call_sid → asset_id ───────────────────────────────────────
_call_asset_map: dict = {}


# ── Pydantic models ───────────────────────────────────────────────────────────

class CallRequest(BaseModel):
    asset_id: str
    driver_name: Optional[str] = "Rajesh Kumar"
    phone_number: Optional[str] = DEFAULT_DRIVER_PHONE
    site_id: Optional[str] = "S004"
    target_site_id: Optional[str] = "S002"
    reason: Optional[str] = "Equipment-Workload Mismatch (18% Utilization)"
    recommendation: Optional[str] = "Relocate asset to high-demand Site S002"

class DriverResponseRequest(BaseModel):
    call_id: str
    asset_id: str
    response_code: int
    driver_feedback: Optional[str] = ""


# ── POST /telephony/call-driver ───────────────────────────────────────────────

@router.post("/call-driver")
def initiate_call(req: CallRequest, db: Session = Depends(get_db)):
    """
    Dispatches real Twilio outbound voice call.
    Alice reads the script. Driver presses 1/2/3/4. Keypress POSTed to webhook via ngrok.
    """
    phone       = req.phone_number or DEFAULT_DRIVER_PHONE
    driver      = req.driver_name or "Rajesh Kumar"
    asset_id    = req.asset_id
    site_id     = req.site_id or "S004"
    target_site = req.target_site_id or "S002"
    from_num    = TWILIO_FROM_NUMBER

    script_text = (
        f"Hello {driver}. This is the Caterpillar Smart Rental Control Tower. "
        f"Equipment {asset_id} at Site {site_id} has been identified as under-utilized. "
        f"The control tower recommends relocating this equipment to Site {target_site}. "
        f"Please press 1 if you are available for relocation. "
        f"Press 2 if the equipment is currently operating. "
        f"Press 3 if there is a mechanical issue. "
        f"Press 4 to escalate to a supervisor."
    )

    call_sid     = None
    status       = "INITIATED"
    error_detail = None

    try:
        client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Build TwiML — Alice speaks the script, operator responds via web UI keypad
        twiml = VoiceResponse()
        twiml.say(script_text, voice="alice", language="en-IN")
        twiml.pause(length=1)
        twiml.say(
            "Please respond using the Caterpillar Control Tower web portal. Thank you.",
            voice="alice", language="en-IN"
        )
        twiml_str = str(twiml)
        print(f"[TWILIO TwiML]\n{twiml_str}")

        # Use HTTPS directly so Twilio does not fail on 301 redirect
        echo_url = f"https://twimlets.com/echo?Twiml={urllib.parse.quote(twiml_str)}"
        call = client.calls.create(to=phone, from_=from_num, url=echo_url)
        call_sid = call.sid
        status   = call.status
        _call_asset_map[call_sid] = asset_id
        print(f"[TWILIO SUCCESS] SID={call_sid} | To={phone} | Status={status}")

    except Exception as e:
        error_detail = str(e)
        status = "FAILED"
        print(f"[TWILIO ERROR] {error_detail}")

    try:
        db.add(EventLog(
            entity_type="ASSET", entity_id=asset_id,
            event_type="DRIVER_VOICE_CALL",
            message=f"Twilio call to {phone} from {from_num}. Status={status}. SID={call_sid}"
        ))
        db.commit()
    except Exception as db_err:
        print(f"[DB LOG ERROR] {db_err}")

    return {
        "status":       status,
        "call_sid":     call_sid or f"CA-TWILIO-{os.urandom(4).hex()}",
        "driver_name":  driver,
        "phone_number": phone,
        "from_number":  from_num,
        "asset_id":     asset_id,
        "site_id":      site_id,
        "target_site_id": target_site,
        "script":       script_text,
        "error_detail": error_detail,
        "webhook_url":  "NO_PUBLIC_URL"
    }


# ── GET /telephony/call-status/{call_sid} ─────────────────────────────────────

@router.get("/call-status/{call_sid}")
def get_call_status(call_sid: str):
    if call_sid.startswith("CA-TWILIO-"):
        return {"status": "failed", "duration": 0}
    try:
        client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        call = client.calls(call_sid).fetch()
        return {
            "status":     call.status,
            "duration":   int(call.duration or 0),
            "start_time": str(call.start_time) if call.start_time else None,
            "end_time":   str(call.end_time) if call.end_time else None
        }
    except Exception as e:
        return {"status": "unknown", "duration": 0, "error": str(e)}


# ── POST /telephony/twilio-webhook ────────────────────────────────────────────

@router.post("/twilio-webhook")
async def twilio_webhook(
    request: Request,
    asset_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Twilio POSTs here when the driver presses 1/2/3/4 on their phone.
    Resolves asset, updates DB, broadcasts WebSocket event, replies with TwiML.
    """
    form_data = await request.form()
    digits    = form_data.get("Digits", "")
    call_sid  = form_data.get("CallSid", "")

    resolved_asset_id = asset_id or _call_asset_map.get(call_sid, "UNKNOWN")
    response_code = int(digits) if digits and digits.isdigit() else 0

    print(f"[WEBHOOK] SID={call_sid} | Asset={resolved_asset_id} | Digit={digits}")

    response_map = {
        1: ("AVAILABLE_FOR_RELOCATION", "Driver confirmed available for relocation.",       "TRANSITIONING"),
        2: ("CURRENTLY_OPERATING",      "Driver reported asset is actively operating.",     "ACTIVE"),
        3: ("EQUIPMENT_ISSUE",          "Driver reported a mechanical issue.",              "MAINTENANCE"),
        4: ("CONTACT_SUPERVISOR",       "Driver requested supervisor callback.",            "PENDING_REVIEW"),
    }
    resp_key, msg, asset_status = response_map.get(
        response_code,
        ("NO_INPUT", "No keypress received.", "ACTIVE")
    )

    if resolved_asset_id != "UNKNOWN":
        asset_obj = db.query(Asset).filter(Asset.id == resolved_asset_id).first()
        if asset_obj:
            asset_obj.status = asset_status
            db.commit()

    try:
        db.add(EventLog(
            entity_type="ASSET", entity_id=resolved_asset_id,
            event_type="DRIVER_KEYPRESS_MOBILE",
            message=f"Twilio keypress [{response_code}] -> {resp_key} -> {asset_status}"
        ))
        db.commit()
    except Exception as db_err:
        print(f"[DB LOG ERROR] {db_err}")

    await ws_manager.broadcast({
        "type":           "DRIVER_KEYPRESS_EVENT",
        "asset_id":       resolved_asset_id,
        "response_code":  response_code,
        "response_label": resp_key,
        "message":        msg,
        "new_status":     asset_status,
    })

    reply_text_map = {
        1: "Relocation confirmed. The Control Tower will arrange transportation. Thank you.",
        2: "Understood. Equipment marked as active. No action required. Thank you.",
        3: "Maintenance alert sent. A technician will be dispatched. Thank you.",
        4: "Escalated. A supervisor will contact you shortly. Thank you.",
    }
    reply_text = reply_text_map.get(
        response_code,
        "Response recorded. Thank you for responding to Caterpillar Control Tower."
    )

    twiml_reply = VoiceResponse()
    twiml_reply.say(reply_text, voice="alice", language="en-IN")
    return Response(content=str(twiml_reply), media_type="application/xml")


# ── POST /telephony/driver-response (web UI keypad) ──────────────────────────

@router.post("/driver-response")
async def process_driver_response(req: DriverResponseRequest, db: Session = Depends(get_db)):
    """Processes response from the web UI interactive keypad (not the phone)."""
    response_map = {
        1: ("AVAILABLE_FOR_RELOCATION", "Driver confirmed available for relocation.",  "TRANSITIONING"),
        2: ("CURRENTLY_OPERATING",      "Driver reported asset is actively operating.", "ACTIVE"),
        3: ("EQUIPMENT_ISSUE",          "Driver reported a mechanical issue.",          "MAINTENANCE"),
        4: ("CONTACT_SUPERVISOR",       "Driver requested supervisor callback.",        "PENDING_REVIEW"),
    }
    resp_key, msg, asset_status = response_map.get(
        req.response_code,
        ("UNKNOWN", "Response recorded.", "ACTIVE")
    )

    asset_obj = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if asset_obj:
        asset_obj.status = asset_status
        db.commit()

    try:
        db.add(EventLog(
            entity_type="ASSET", entity_id=req.asset_id,
            event_type="DRIVER_FEEDBACK",
            message=f"Web keypad [{req.response_code}]: {resp_key} — {msg}"
        ))
        db.commit()
    except Exception as db_err:
        print(f"[DB LOG ERROR] {db_err}")

    await ws_manager.broadcast({
        "type":           "DRIVER_KEYPRESS_EVENT",
        "asset_id":       req.asset_id,
        "response_code":  req.response_code,
        "response_label": resp_key,
        "message":        msg,
        "new_status":     asset_status,
    })

    return {
        "status":           "RESPONSE_PROCESSED",
        "response_code":    req.response_code,
        "response_label":   resp_key,
        "message":          msg,
        "new_asset_status": asset_status,
        "asset_id":         req.asset_id
    }
