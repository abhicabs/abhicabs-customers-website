// src/components/GlobalCallRemark.js — mounts the after-call remark sheet app-wide.
// Subscribes to showAfterCallRemark() (fired by PendingCallResumer when a call ends) and shows CallRemarkSheet OVER
// the current screen. For the Not Interested / Invalid flows, it falls back to the lead detail (their own screens).
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import CallRemarkSheet from './CallRemarkSheet';
import { onAfterCallRemark } from '../services/pendingCallService';

export default function GlobalCallRemark() {
  const navigation = useNavigation();
  const [target, setTarget] = useState(null);   // { leadId, number }

  useEffect(() => onAfterCallRemark((p) => { if (p?.leadId) setTarget(p); }), []);

  if (!target) return null;
  return (
    <CallRemarkSheet
      visible={!!target}
      leadId={target.leadId}
      onClose={() => setTarget(null)}
      onDone={() => setTarget(null)}
      onNeedsLeadDetail={(leadId, outcome) => {
        setTarget(null);
        // Not Interested / Invalid: open the lead detail where those verification flows live.
        navigation.navigate('LeadDetail', { leadId, resumeRemark: true });
      }}
    />
  );
}
