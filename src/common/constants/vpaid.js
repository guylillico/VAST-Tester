export const VPAID_EVENT_NAMES = [
  'AdLoaded',
  'AdStarted',
  'AdStopped',
  'AdSkipped',
  'AdSkippableStateChange',
  'AdSizeChange',
  'AdLinearChange',
  'AdDurationChange',
  'AdExpandedChange',
  'AdRemainingTimeChange',
  'AdVolumeChange',
  'AdImpression',
  'AdVideoStart',
  'AdVideoFirstQuartile',
  'AdVideoMidpoint',
  'AdVideoThirdQuartile',
  'AdVideoComplete',
  'AdClickThru',
  'AdInteraction',
  'AdUserAcceptInvitation',
  'AdUserMinimize',
  'AdUserClose',
  'AdPaused',
  'AdPlaying',
  'AdLog',
  'AdError'
]

export const VPAID_PROPERTY_NAMES = [
  'adWidth',
  'adHeight',
  'adLinear',
  'adExpanded',
  'adSkippableState',
  'adRemainingTime',
  'adDuration',
  'adVolume'
]

export const VPAID_EVENT_TYPE_TO_VAST_EVENT_TYPE = {
  AdLoaded: 'loaded',
  AdSkipped: 'skip',
  AdStarted: 'creativeView',
  AdImpression: 'impression',
  AdVideoStart: 'start',
  AdVideoFirstQuartile: 'firstQuartile',
  AdVideoMidpoint: 'midpoint',
  AdVideoThirdQuartile: 'thirdQuartile',
  AdVideoComplete: 'complete',
  AdUserAcceptInvitation: 'acceptInvitation',
  AdUserMinimize: 'collapse',
  AdUserClose: 'close',
  AdPaused: 'pause',
  AdPlaying: 'resume',
  AdClickThru: 'clickThrough',
  AdError: 'error'
}
