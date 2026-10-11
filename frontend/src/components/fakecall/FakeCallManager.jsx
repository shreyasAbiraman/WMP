import React from 'react';
import { FakeCallConfigModal } from './FakeCallConfigModal';
import { ScheduledCallBanner } from './ScheduledCallBanner';
import { IncomingCallOverlay } from './IncomingCallOverlay';
import { ConnectedCallOverlay } from './ConnectedCallOverlay';

export const FakeCallManager = () => {
  return (
    <>
      <FakeCallConfigModal />
      <ScheduledCallBanner />
      <IncomingCallOverlay />
      <ConnectedCallOverlay />
    </>
  );
};
