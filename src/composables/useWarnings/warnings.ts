import { Recommendation } from '../useRecommendations/Recommendation.types';

export const warnings: Recommendation[] = [
  {
    id: 'webrtc-leak',
    type: 'warning',
    name: 'WebRTC leaks have been detected',
    description: 'WebRTC is leaking some internal IPs.',
    ctaUrl:
      'https://www.ivpn.net/knowledgebase/general/my-ip-is-being-leaked-by-webrtc-how-do-i-disable-it/',
    iconType: 'leak',
    activated: false,
    ignored: false,
    ctaLabel: undefined,
  },
];
