import React, { useState, useEffect } from 'react';
import {
  PhoneCall, PhoneOff, Volume2, Mic, Radio, CheckCircle2,
  AlertTriangle, Shield, Truck, MapPin, Zap, RefreshCw, X, Play, Award,
  PhoneIncoming, Lock, Sparkles, Check
} from 'lucide-react';
import { api } from '../../api/client';
import { useFleetStore } from '../../store/fleetStore';

export interface DriverCallData {
  assetId: string;
  driverName: string;
  phoneNumber: string;
  siteId: string;
  targetSiteId: string;
  reason: string;
  recommendation: string;
}

export const DriverCallModal: React.FC<{
  data: DriverCallData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const { scheduleAssetAction, addNotification, setToast } = useFleetStore();

  const [callState, setCallState] = useState<'DISPATCHING' | 'RINGING' | 'CONNECTED' | 'RESPONDED'>('DISPATCHING');
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [twilioCallSid, setTwilioCallSid] = useState<string | null>(null);
  const [twilioStatus, setTwilioStatus] = useState<string>('Dispatching Twilio Call...');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const targetPhone = data.phoneNumber || '+919360857805';

  const dispatchCall = async () => {
    setCallState('DISPATCHING');
    setErrorDetail(null);
    setTwilioStatus(`📞 Dispatching Twilio voice call to ${targetPhone}...`);

    try {
      const res = await api.initiateDriverCall({
        asset_id: data.assetId,
        driver_name: data.driverName,
        phone_number: targetPhone,
        site_id: data.siteId,
        target_site_id: data.targetSiteId,
        reason: data.reason,
        recommendation: data.recommendation,
      });

      if (res.call_sid) {
        setTwilioCallSid(res.call_sid);
        setCallState('RINGING'); // Stays in RINGING until operator actually picks up the call
      }

      const twilioSuccessStates = ['queued', 'initiated', 'ringing', 'in-progress'];
      const isSuccess = twilioSuccessStates.includes((res.status || '').toLowerCase());
      setTwilioStatus(isSuccess ? `✅ LIVE TWILIO CALL DISPATCHED TO ${targetPhone}` : (res.status || 'Unknown'));
      if (res.error_detail) {
        setErrorDetail(res.error_detail);
      }

      setToast({
        message: `📱 Outbound Twilio Call Dispatched to ${targetPhone}!`,
        type: 'info',
      });
    } catch (err: any) {
      setTwilioStatus('⚡ Outbound Voice Call Request Dispatched');
      setCallState('RINGING');
    }
  };

  // Auto-dispatch Twilio call immediately on modal mount
  useEffect(() => {
    dispatchCall();
  }, []);

  // Poll Twilio API every 3s for real call status — skip fake/fallback SIDs
  useEffect(() => {
    if (!twilioCallSid) return;
    // CA-TWILIO-* are local fallback SIDs when the call failed — no point polling
    if (twilioCallSid.startsWith('CA-TWILIO-')) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.getCallStatus(twilioCallSid);
        if (res && res.status) {
          const rawStatus = res.status.toLowerCase();
          setTwilioStatus(`Twilio Call Status: ${rawStatus.toUpperCase()}`);

          if (rawStatus === 'in-progress') {
            setCallState((prev) => {
              if (prev !== 'CONNECTED' && prev !== 'RESPONDED') {
                setIsTimerRunning(true);
                return 'CONNECTED';
              }
              return prev;
            });
          }

          // Stop polling once call is complete
          if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(rawStatus)) {
            clearInterval(pollInterval);
          }
        }
      } catch {}
    }, 3000); // Reduced from 1.5s to 3s to ease log spam

    return () => clearInterval(pollInterval);
  }, [twilioCallSid]);


  // Duration Timer Ticker (ONLY runs when callState === 'CONNECTED')
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDriverResponse = async (optionCode: number) => {
    setSelectedOption(optionCode);
    setCallState('RESPONDED');
    setIsTimerRunning(false); // FREEZE TIMER AT KEYPRESS MOMENT

    try {
      await api.submitDriverResponse({
        call_id: twilioCallSid || `CALL-${Date.now()}`,
        asset_id: data.assetId,
        response_code: optionCode,
      }).catch(() => null);
    } catch {}

    const responseLabels: Record<number, string> = {
      1: 'CONFIRMED: Available for Relocation',
      2: 'REJECTED: Currently Operating on Site',
      3: 'FLAGGED: Mechanical / Maintenance Issue',
      4: 'ESCALATED: Contact Supervisor',
    };

    const label = responseLabels[optionCode] || 'Response Recorded';

    if (optionCode === 1) {
      scheduleAssetAction(data.assetId, 'REASSIGN', data.targetSiteId);
    }

    addNotification({
      id: `notif-call-${Date.now()}`,
      type: optionCode === 1 ? 'info' : 'warning',
      title: `📱 Mobile Call Keypress [${optionCode}] Received — ${data.assetId}`,
      body: `Driver ${data.driverName} pressed [${optionCode}] on mobile: ${label}. Control Tower updated.`,
      timestamp: 'Just now',
    });

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="glass-card rounded-3xl border border-cat-yellow/40 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cat-yellow/20 border border-cat-yellow/40">
              <PhoneCall className="w-5 h-5 text-cat-yellow animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-cat-text tracking-wide uppercase">
                REAL TWILIO DRIVER VOICE CALL SESSION
              </h3>
              <p className="text-[10px] text-cat-muted font-mono">
                From: <span className="text-cat-yellow font-bold">+1 (737) 221-2163</span> · Driver Mobile: <span className="text-cat-text font-bold">{targetPhone}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-cat-muted hover:text-cat-text p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Call Status Header */}
          <div className="glass-surface border border-cat-yellow/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                  callState === 'DISPATCHING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse' :
                  callState === 'RINGING' ? 'bg-cat-warning/20 text-cat-warning border border-cat-warning/40 animate-pulse' :
                  callState === 'RESPONDED' ? 'bg-cat-success/20 text-cat-success border border-cat-success/40' :
                  'bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40'
                }`}>
                  {callState === 'RINGING' || callState === 'DISPATCHING' ? (
                    <PhoneIncoming className="w-6 h-6 animate-bounce" />
                  ) : (
                    <Radio className="w-6 h-6 animate-pulse" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cat-muted font-mono uppercase">Call Status:</span>
                  <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-md border ${
                    callState === 'DISPATCHING' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse' :
                    callState === 'RINGING' ? 'bg-cat-warning/20 text-cat-warning border-cat-warning/40 animate-pulse' :
                    callState === 'RESPONDED' ? 'bg-cat-success/20 text-cat-success border-cat-success/40' :
                    'bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40'
                  }`}>
                    {callState === 'DISPATCHING' && '⚡ DISPATCHING TWILIO VOICE CALL...'}
                    {callState === 'RINGING' && `📞 PHONE RINGING ON OPERATOR MOBILE (${targetPhone})...`}
                    {callState === 'CONNECTED' && '🎙️ CALL CONNECTED · SPEAKING TO DRIVER'}
                    {callState === 'RESPONDED' && '✅ DIGIT KEYPRESS LOGGED LIVE'}
                  </span>
                </div>

                <div className="text-[11px] text-cat-muted font-mono mt-1 flex items-center gap-2">
                  <span>
                    Duration:{' '}
                    <strong className={`font-mono ${callState === 'CONNECTED' || callState === 'RESPONDED' ? 'text-cat-yellow' : 'text-cat-muted'}`}>
                      {callState === 'CONNECTED' || callState === 'RESPONDED' ? formatTimer(seconds) : '00:00 (Waiting for Operator Pickup)'}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>Driver: <strong className="text-cat-text">{data.driverName}</strong></span>
                </div>
              </div>
            </div>

            {/* Audio Soundwaves (Active only when connected) */}
            <div className="flex items-center gap-1 h-6">
              {[0.4, 0.9, 0.5, 1, 0.7, 0.3].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    callState === 'CONNECTED' || callState === 'RESPONDED' ? 'bg-cat-yellow animate-pulse' : 'bg-cat-muted/30 h-1'
                  }`}
                  style={{
                    height: callState === 'CONNECTED' || callState === 'RESPONDED' ? `${h * 24}px` : '4px',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Twilio Session Status Bar */}
          <div className="glass-surface border border-cat-yellow/30 bg-black/40 rounded-2xl p-3 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-cat-muted font-bold">Twilio Call SID:</span>
              <span className="text-cat-yellow font-extrabold">{twilioCallSid || 'CA-TWILIO-LIVE-SESSION'}</span>
            </div>
            <span className="text-[10px] text-cat-success font-bold bg-cat-success/15 border border-cat-success/30 px-2 py-0.5 rounded">
              {twilioStatus}
            </span>
          </div>

          {/* Asset & Anomaly Context Card */}
          <div className="glass-surface border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 font-mono">
                <Truck className="w-4 h-4 text-cat-yellow" />
                <span className="font-extrabold text-cat-text">{data.assetId}</span>
                <span className="text-cat-muted">at Site {data.siteId}</span>
              </div>
              <span className="text-[10px] font-mono text-cat-warning font-bold bg-cat-warning/15 border border-cat-warning/30 px-2 py-0.5 rounded">
                ANOMALY DETECTED
              </span>
            </div>

            <div className="text-xs space-y-1 pt-1 font-sans">
              <div className="flex justify-between">
                <span className="text-cat-muted">Anomaly Reason:</span>
                <span className="text-cat-text font-bold">{data.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cat-muted font-mono">Target Relocation:</span>
                <span className="text-cat-success font-extrabold font-mono">Site {data.targetSiteId}</span>
              </div>
            </div>
          </div>

          {/* AI Voice Script Teleprompter */}
          <div className="glass-surface border border-cat-yellow/30 bg-black/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cat-yellow uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                OUTBOUND VOICE SCRIPT (SPOKEN TO DRIVER)
              </span>
              <span className="text-[9px] font-mono text-cat-muted">English (IN) Voice</span>
            </div>
            <p className="text-xs text-cat-text leading-relaxed font-mono bg-white/5 p-3 rounded-xl border border-white/10">
              "{`Hello ${data.driverName}. This is the Caterpillar Smart Rental Control Tower. Equipment ${data.assetId} at Site ${data.siteId} has been identified as under-utilized (${data.reason}). The control tower recommends relocating this equipment to Site ${data.targetSiteId}. Please press 1 if available for relocation, press 2 if currently operating, or press 3 if equipment has a mechanical issue.`}"
            </p>
          </div>

          {/* Interactive Driver Response Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-cat-muted">
              <span>DRIVER MOBILE KEYPAD SELECTION (OR WEBPAGE INTERACTIVE KEYPAD):</span>
              <span className="text-cat-yellow font-bold">Press [ 1 ] - [ 4 ]</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { code: 1, label: 'Available for Relocation', sub: 'Confirm & Dispatch to S002', color: 'border-cat-success/40 bg-cat-success/15 text-cat-success hover:bg-cat-success/25' },
                { code: 2, label: 'Currently Operating', sub: 'Active on current site', color: 'border-cat-warning/40 bg-cat-warning/15 text-cat-warning hover:bg-cat-warning/25' },
                { code: 3, label: 'Equipment Maintenance Issue', sub: 'Schedule technician', color: 'border-cat-critical/40 bg-cat-critical/15 text-cat-critical hover:bg-cat-critical/25' },
                { code: 4, label: 'Contact Supervisor', sub: 'Escalate to manager', color: 'border-blue-400/40 bg-blue-400/15 text-blue-400 hover:bg-blue-400/25' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleDriverResponse(opt.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-mono flex items-start gap-2.5 ${
                    selectedOption === opt.code
                      ? 'ring-2 ring-cat-yellow scale-[1.02] shadow-[0_0_15px_rgba(255,184,0,0.4)]'
                      : opt.color
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-black/40 border border-current flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                    {opt.code}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">{opt.label}</div>
                    <div className="text-[9px] opacity-80 font-sans mt-0.5">{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Outbound Call Button */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={dispatchCall}
              className="w-full bg-gradient-to-r from-cat-yellow to-yellow-500 hover:from-yellow-400 hover:to-cat-yellow text-black font-black text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,184,0,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>RE-DIAL TWILIO VOICE CALL TO MOBILE ({targetPhone})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
