import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SONAR_HIDE_LAYER } from './SonarScreen'
import skylineUrl from './assets/blue-hour/distant-skyline.png?inline'

// Generated scenic backdrop only. Outside the surveyed lake; explicitly absent
// from every sonar pass. It contains no boat, targets, water or product imagery.
export default function BlueHourEnvironment() {
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(skylineUrl)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh position={[0, 135, -280]} onUpdate={o => o.layers.set(SONAR_HIDE_LAYER)}>
    <planeGeometry args={[780, 280]} />
    <meshBasicMaterial map={texture} fog={false} toneMapped={false} />
  </mesh>
}
