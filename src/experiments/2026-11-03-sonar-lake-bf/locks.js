// Which views sit behind the subscribe card in this locked copy (#191). Pure, so scripts/dev/mkt-lock-rule-test.mjs can run it in node.
import { miniOnly } from './embed'

// the views behind the subscribe card (#191); PingLive's Panoramic too in this locked copy (#240, Jason 11-04: “锁全景 Panoramic”) — its
// Down and Forward stay free
// The US store page (miniOnly: in the store, market us; Mini only, #190) opens the Mini's Live Combo for free (#241, Jason 11-04: “美国的把
// combo打开吧 保留panoramic”); its Panoramic and the ice views stay locked. Every other market keeps Combo locked.
export const isLocked = (d, m) => (m === 'combo' && !miniOnly()) || m === 'ice' || m === 'panoramic'
