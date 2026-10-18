import { PALETTE } from './palette';
import { roundTo } from './rng';

export interface Tower {
  x: number;
  width: number;
  roof: number;
  roofLeft: number;
  roofWidth: number;
}

export interface Packet {
  x: number;
  y: number;
  height: number;
  color: string;
  rise: number;
  durationSeconds: number;
  startOffsetSeconds: number;
}

export interface StreamBeam {
  centerX: number;
  top: number;
  height: number;
  gradientIndex: number;
  packets: Packet[];
}

export const BEAM_COLORS = [PALETTE.pink, PALETTE.teal, PALETTE.violet, PALETTE.apricot] as const;

const PACKET_COLORS = [PALETTE.teal, PALETTE.pink, PALETTE.apricot, PALETTE.teal] as const;
const BEAM_HEIGHTS = [200, 150, 220, 140, 175];

const PICK = { maxBeams: 5, edgeMargin: 90, minTowerHeight: 80, minRoofY: 60, minSpacing: 190 } as const;

const ROOF_POSITION = { even: 0.4, odd: 0.6 } as const;

export const BEAM_SHAPE = {
  glowWidth: 24,
  glowOpacity: 0.07,
  coreWidth: 3,
  coreOpacity: 0.16,
  coreStart: 0.1,
} as const;

const PACKET = {
  count: 6,
  offsetRight: 2.8,
  offsetLeft: -4.2,
  gapAboveRoof: 1,
  baseHeight: 4,
  heightStep: 2,
  heightVariants: 3,
  riseShare: 0.9,
  baseDuration: 5,
  durationVariants: 5,
  maxStartOffsetTenths: 90,
} as const;

export const PACKET_SHAPE = { width: 1.4, cornerRadius: 0.7 } as const;

const SPREAD = { durationPacket: 7, durationBeam: 3, offsetPacket: 11, offsetBeam: 17 } as const;
const TENTHS = 10;

const isOdd = (value: number) => value % 2 === 1;

export function pickBeamTowers(towers: Tower[], skylineWidth: number, skylineHeight: number): Tower[] {
  const middle = skylineWidth / 2;
  const centerOf = (tower: Tower) => tower.x + tower.width / 2;
  const distanceToMiddle = (tower: Tower) => Math.abs(centerOf(tower) - middle);
  const byDistanceToMiddle = [...towers].sort((first, second) => distanceToMiddle(first) - distanceToMiddle(second));
  const picks: Tower[] = [];

  for (const tower of byDistanceToMiddle) {
    const isNearEdge = tower.x < PICK.edgeMargin || tower.x + tower.width > skylineWidth - PICK.edgeMargin;
    const isTall = skylineHeight - tower.roof > PICK.minTowerHeight;
    const isRoofVisible = tower.roof >= PICK.minRoofY;
    const isSpacedOut = picks.every((pick) => Math.abs(centerOf(pick) - centerOf(tower)) > PICK.minSpacing);

    if (picks.length < PICK.maxBeams && !isNearEdge && isTall && isRoofVisible && isSpacedOut) picks.push(tower);
  }

  return picks;
}

function buildPackets(centerX: number, roof: number, beamHeight: number, beamIndex: number): Packet[] {
  return Array.from({ length: PACKET.count }, (_, index) => {
    const height = PACKET.baseHeight + (index % PACKET.heightVariants) * PACKET.heightStep;

    return {
      x: roundTo(centerX + (isOdd(index) ? PACKET.offsetRight : PACKET.offsetLeft)),
      y: roof - height - PACKET.gapAboveRoof,
      height,
      color: PACKET_COLORS[(index + beamIndex) % PACKET_COLORS.length],
      rise: Math.round(beamHeight * PACKET.riseShare),
      durationSeconds:
        PACKET.baseDuration +
        ((index * SPREAD.durationPacket + beamIndex * SPREAD.durationBeam) % PACKET.durationVariants),
      startOffsetSeconds:
        ((index * SPREAD.offsetPacket + beamIndex * SPREAD.offsetBeam) % PACKET.maxStartOffsetTenths) / TENTHS,
    };
  });
}

export function buildStreamBeams(towers: Tower[], skylineWidth: number, skylineHeight: number): StreamBeam[] {
  return pickBeamTowers(towers, skylineWidth, skylineHeight).map((tower, index) => {
    const roofPosition = isOdd(index) ? ROOF_POSITION.odd : ROOF_POSITION.even;
    const centerX = roundTo(tower.roofLeft + tower.roofWidth * roofPosition);
    const height = BEAM_HEIGHTS[index % BEAM_HEIGHTS.length];

    return {
      centerX,
      top: roundTo(tower.roof - height),
      height,
      gradientIndex: index % BEAM_COLORS.length,
      packets: buildPackets(centerX, tower.roof, height, index),
    };
  });
}
