// Renders exercise illustrations as SVG from joint angles, so every image
// shares the same figure, proportions and colors. See poses.mjs for the data.

const SIZE = 1024
const CENTER = SIZE / 2
/** The app crops images to a circle; the figure's bounding box stays inside this one. */
const SAFE_RADIUS = 400

const COLOR = {
  background: '#1D2230',
  floor: '#2A3040',
  prop: '#3A4256',
  near: '#E8EAF0',
  far: '#8B93A7',
  accent: '#F43F5E',
}

/** Segment lengths and stroke widths of the figure (standing height ≈ 620 px). */
const BODY = {
  torso: 215,
  neck: 62,
  headRadius: 46,
  upperArm: 122,
  forearm: 108,
  thigh: 175,
  shin: 170,
  foot: 58,
  /** Half the shoulder and hip width, used in front views only. */
  shoulderOffset: 50,
  hipOffset: 30,
  width: { torso: 92, neck: 34, upperArm: 40, forearm: 34, thigh: 54, shin: 42, foot: 30 },
}

const rad = (deg) => (deg * Math.PI) / 180
const angleOf = (from, to) => (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
const step = ([x, y], angle, length) => [
  x + Math.cos(rad(angle)) * length,
  y + Math.sin(rad(angle)) * length,
]

/**
 * Two-bone inverse kinematics: where the middle joint goes when the chain
 * `start` → joint → end should reach `target`. `bend` (1 or -1) picks the side.
 */
function joint(start, target, a, b, bend) {
  const d = Math.min(Math.hypot(target[0] - start[0], target[1] - start[1]), a + b - 0.01)
  const cos = (a * a + d * d - b * b) / (2 * a * d)
  const t = rad(angleOf(start, target)) + bend * Math.acos(Math.max(-1, Math.min(1, cos)))
  return [start[0] + Math.cos(t) * a, start[1] + Math.sin(t) * a]
}

/**
 * Pose format (all angles absolute, degrees, SVG orientation: 0 = right/forward,
 * 90 = down, -90 = up, 180 = left/back):
 *
 *   torso, head        direction hip → neck and neck → head
 *   near, far          limbs; `far` inherits everything from `near`
 *     leg: [thigh, shin] or footTo: target (+ legBend)
 *     foot               angle of the foot, default: perpendicular to the shin
 *     arm: [upper, fore] or reach: target (+ bend)
 *   front              front or top view: shoulders and hips get width, no shading
 *   floor              false hides the floor line (top views)
 *   highlight          segment ids, e.g. 'near.thigh', 'torso', 'neck'
 *   props              see drawProp
 *
 * Targets: 'head', 'hip', 'neck', 'near.knee', 'far.toe' …, { floor: dx } for a
 * spot on the floor dx from the hip, or { x, y } relative to the hip.
 */
function solve(pose) {
  const hip = [0, 0]
  const neck = step(hip, pose.torso, BODY.torso)
  const shoulder = step(hip, pose.torso, BODY.torso * 0.9)
  const head = step(neck, pose.head ?? pose.torso, BODY.neck)
  const body = { hip, neck, shoulder, head, limbs: { near: {}, far: {} }, floorY: 0 }

  // `far` inherits from `near`, but its own angles win over inherited targets.
  const spec = (side) => {
    const own = pose[side] ?? {}
    const merged = { ...pose.near, ...own }
    if (side === 'far' && own.leg) delete merged.footTo
    if (side === 'far' && own.arm) delete merged.reach
    return merged
  }
  // Front views spread shoulders and hips; "near" is on the right of the picture.
  const offset = (side, length) =>
    pose.front ? step([0, 0], pose.torso + (side === 'near' ? 90 : -90), length) : [0, 0]
  const add = (p, o) => [p[0] + o[0], p[1] + o[1]]

  // Legs aimed at the other leg are solved after it.
  const legOrder = ['near', 'far'].sort((a, b) => !!spec(a).footTo - !!spec(b).footTo)
  for (const side of legOrder) {
    const s = spec(side)
    const root = add(hip, offset(side, BODY.hipOffset))
    let knee, ankle
    if (s.footTo) {
      const target = resolveTarget(s.footTo, body)
      knee = joint(root, target, BODY.thigh, BODY.shin, s.legBend ?? 1)
      ankle = step(knee, angleOf(knee, target), BODY.shin)
    } else {
      knee = step(root, s.leg[0], BODY.thigh)
      ankle = step(knee, s.leg[1], BODY.shin)
    }
    const toe = step(ankle, s.foot ?? angleOf(knee, ankle) - 90, BODY.foot)
    Object.assign(body.limbs[side], { root, knee, ankle, toe })
  }

  // The floor touches the lowest point of everything except the arms.
  const w = BODY.width
  const low = [
    hip[1] + w.thigh / 2,
    neck[1] + w.torso / 2,
    shoulder[1] + w.torso / 2,
    head[1] + BODY.headRadius,
    ...Object.values(body.limbs).flatMap((l) => [
      l.knee[1] + w.thigh / 2,
      l.ankle[1] + w.shin / 2,
      l.toe[1] + w.foot / 2,
    ]),
  ]
  body.floorY = Math.max(...low)

  for (const side of ['near', 'far']) {
    const s = spec(side)
    const root = add(shoulder, offset(side, BODY.shoulderOffset))
    let elbow, hand
    if (s.reach) {
      const target = resolveTarget(s.reach, body)
      elbow = joint(root, target, BODY.upperArm, BODY.forearm, s.bend ?? 1)
      hand = step(elbow, angleOf(elbow, target), BODY.forearm)
    } else {
      elbow = step(root, s.arm[0], BODY.upperArm)
      hand = step(elbow, s.arm[1], BODY.forearm)
    }
    Object.assign(body.limbs[side], { shoulder: root, elbow, hand })
  }
  return body
}

function resolveTarget(target, body) {
  if (typeof target === 'string') {
    if (target in body && Array.isArray(body[target])) return body[target]
    const [side, point] = target.split('.')
    const p = body.limbs[side]?.[point]
    if (!p) throw new Error(`unknown target ${target}`)
    return p
  }
  if ('floor' in target) return [target.floor, body.floorY - BODY.width.forearm / 2]
  return [target.x, target.y]
}

function segments(body, front) {
  const list = []
  const w = BODY.width
  for (const side of ['far', 'near']) {
    const l = body.limbs[side]
    const tone = front ? 'near' : side
    list.push(
      { id: `${side}.thigh`, tone, from: l.root, to: l.knee, width: w.thigh },
      { id: `${side}.shin`, tone, from: l.knee, to: l.ankle, width: w.shin },
      { id: `${side}.foot`, tone, from: l.ankle, to: l.toe, width: w.foot },
      { id: `${side}.upperArm`, tone, from: l.shoulder, to: l.elbow, width: w.upperArm },
      { id: `${side}.forearm`, tone, from: l.elbow, to: l.hand, width: w.forearm },
    )
  }
  list.push({ id: 'torso', tone: 'near', from: body.hip, to: body.neck, width: w.torso })
  list.push({ id: 'neck', tone: 'near', from: body.shoulder, to: body.head, width: w.neck })
  return list
}

/** Largest scale at which the bounding box fits the safe circle; centred. */
function fit(points, body, pose) {
  const pad = BODY.width.torso / 2
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = pose.floor === false ? Math.max(...ys) + pad : Math.max(body.floorY, ...ys)
  const scale = Math.min(1.5, (2 * SAFE_RADIUS) / Math.hypot(maxX - minX, maxY - minY))
  const dx = CENTER - ((minX + maxX) / 2) * scale
  const dy = CENTER - ((minY + maxY) / 2) * scale
  return {
    map: (p) => [p[0] * scale + dx, p[1] * scale + dy],
    scale,
    floor: body.floorY * scale + dy,
    top: minY * scale + dy,
  }
}

const fmt = (n) => Math.round(n * 10) / 10

export function render(pose) {
  const body = solve(pose)
  const segs = segments(body, pose.front)
  const all = segs.flatMap((s) => [s.from, s.to]).concat([body.head])
  const { map, scale, floor } = fit(all, body, pose)
  const at = (p) => map(p).map(fmt)
  const highlight = new Set(pose.highlight ?? [])
  for (const id of highlight) {
    if (!segs.some((s) => s.id === id)) throw new Error(`unknown highlight ${id}`)
  }

  const line = (s, color, width, extra = '') => {
    const [x1, y1] = at(s.from)
    const [x2, y2] = at(s.to)
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${fmt(width * scale)}" stroke-linecap="round"${extra}/>`
  }

  const glow = segs
    .filter((s) => highlight.has(s.id))
    .map((s) => line(s, COLOR.accent, s.width + 46, ' opacity="0.6"'))
    .join('')

  const ctx = { at, body, scale, floor }
  const props = (pose.props ?? []).map((p) => drawProp(p, ctx)).join('')

  const order = [
    ...segs.filter((s) => s.id.startsWith('far.')),
    ...segs.filter((s) => s.id === 'torso' || s.id === 'neck'),
    ...segs.filter((s) => s.id.startsWith('near.')),
  ]
  const figure = order.map((s) => line(s, COLOR[s.tone], s.width)).join('')
  const [hx, hy] = at(body.head)
  const floorLine =
    pose.floor === false
      ? ''
      : `<rect x="${CENTER - SAFE_RADIUS - 60}" y="${fmt(floor)}" width="${SAFE_RADIUS * 2 + 120}" height="10" rx="5" fill="${COLOR.floor}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
<rect width="${SIZE}" height="${SIZE}" fill="${COLOR.background}"/>
${floorLine}
${props}
<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${fmt(18 * scale)}"/></filter></defs>
<g filter="url(#glow)">${glow}</g>
<g>${figure}<circle cx="${hx}" cy="${hy}" r="${fmt(BODY.headRadius * scale)}" fill="${COLOR.near}"/></g>
</svg>
`
}

/**
 * Flat props behind the figure:
 *   wall  { at: target, side: 'left' | 'right' }  full-height wall touching a point
 *   post  { at: target }                           door frame post through a point
 *   band  { from: target, to: target }             strap or band
 *   stick { from: target, to: target }             rigid stick
 */
function drawProp(prop, { at, body, scale, floor }) {
  const point = (t) => at(resolveTarget(t, body))
  const top = CENTER - SAFE_RADIUS - 60
  switch (prop.type) {
    case 'wall': {
      const [x] = point(prop.at)
      const width = 28
      const gap = (BODY.width.forearm / 2) * scale
      const wx = prop.side === 'right' ? x + gap : x - gap - width
      return `<rect x="${fmt(wx)}" y="${top}" width="${width}" height="${fmt(floor - top)}" fill="${COLOR.prop}"/>`
    }
    case 'post': {
      const [x] = point(prop.at)
      return `<rect x="${fmt(x - 16)}" y="${top}" width="32" height="${fmt(floor - top)}" rx="6" fill="${COLOR.prop}"/>`
    }
    case 'band':
    case 'stick': {
      const [x1, y1] = point(prop.from)
      const [x2, y2] = point(prop.to)
      const width = prop.type === 'band' ? 12 : 18
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLOR.prop}" stroke-width="${fmt(width * scale)}" stroke-linecap="round"/>`
    }
    default:
      throw new Error(`unknown prop ${prop.type}`)
  }
}
