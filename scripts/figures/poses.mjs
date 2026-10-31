// One pose per catalog exercise id; see render.mjs for the format.
// Angles: 0 = forward/right, 90 = down, -90 = up, 180 = back/left.
// Bilateral exercises show the LEFT side as the near, worked side; the app mirrors it for right.

const STAND = { leg: [90, 90], foot: 0 }
const HANG = { arm: [95, 90] }
const FRONT_STAND = {
  near: { leg: [90, 90], foot: 20, arm: [82, 88] },
  far: { leg: [90, 90], foot: 160, arm: [98, 92] },
}
/** On hands and knees, facing right. */
const ALL_FOURS = { leg: [90, 180], foot: 180 }
/** Kneeling upright on the shins. */
const KNEEL = { leg: [90, 180], foot: 180 }
/** Lying on the back, head to the left. */
const SUPINE = { torso: 180, head: 180 }

export const poses = {
  // Neck
  'neck-side-stretch': {
    front: true,
    torso: -90,
    head: -58,
    near: { ...FRONT_STAND.near, reach: 'head', bend: -1 },
    far: FRONT_STAND.far,
    highlight: ['neck'],
  },
  'neck-rotation': {
    front: true,
    torso: -90,
    head: -100,
    ...FRONT_STAND,
    highlight: ['neck'],
  },
  'chin-tuck': {
    torso: -90,
    head: -100,
    near: { ...STAND, ...HANG },
    highlight: ['neck'],
  },
  'neck-flexion': {
    torso: -90,
    head: -25,
    near: { ...STAND, ...HANG },
    highlight: ['neck'],
  },

  // Shoulders & chest
  'doorway-pec': {
    front: true,
    torso: -90,
    near: { ...FRONT_STAND.near, arm: [0, -90] },
    far: FRONT_STAND.far,
    props: [{ type: 'post', at: 'near.elbow' }],
    highlight: ['near.upperArm', 'torso'],
  },
  'cross-body-shoulder': {
    front: true,
    torso: -90,
    near: { ...FRONT_STAND.near, arm: [175, 178] },
    far: { ...FRONT_STAND.far, reach: 'near.elbow', bend: 1 },
    highlight: ['near.upperArm'],
  },
  'sleeper-stretch': {
    torso: 0,
    head: 0,
    near: { leg: [165, 150], foot: 170, arm: [-90, 0] },
    far: { leg: [170, 160], foot: 170, reach: 'near.hand', bend: -1 },
    highlight: ['near.upperArm'],
  },
  'puppy-pose': {
    torso: 22,
    head: 30,
    near: { ...ALL_FOURS, reach: { floor: 440 }, bend: 1 },
    highlight: ['near.upperArm', 'torso'],
  },
  'wall-angels': {
    front: true,
    torso: -90,
    near: { ...FRONT_STAND.near, arm: [-5, -90] },
    far: { ...FRONT_STAND.far, arm: [185, -90] },
    highlight: ['near.upperArm', 'far.upperArm'],
  },
  'band-pass-through': {
    front: true,
    torso: -90,
    near: { ...FRONT_STAND.near, arm: [-50, -50] },
    far: { ...FRONT_STAND.far, arm: [-130, -130] },
    props: [{ type: 'stick', from: 'far.hand', to: 'near.hand' }],
    highlight: ['near.upperArm', 'far.upperArm'],
  },

  // Arms & wrists
  'overhead-triceps': {
    front: true,
    torso: -90,
    near: { ...FRONT_STAND.near, arm: [-100, 120] },
    far: { ...FRONT_STAND.far, reach: 'near.elbow', bend: -1 },
    highlight: ['near.upperArm'],
  },
  'biceps-wall': {
    torso: -90,
    near: { ...STAND, arm: [175, 178] },
    far: { ...STAND, ...HANG },
    props: [{ type: 'wall', at: 'near.hand', side: 'left' }],
    highlight: ['near.upperArm', 'near.forearm'],
  },
  'wrist-flexor': {
    torso: -20,
    head: -10,
    near: { ...ALL_FOURS, reach: { floor: 175 }, bend: 1 },
    highlight: ['near.forearm'],
  },
  'wrist-extensor': {
    torso: -32,
    head: -20,
    near: { ...ALL_FOURS, reach: { floor: 150 }, bend: 1 },
    highlight: ['near.forearm'],
  },

  // Back & spine
  'cat-cow': {
    torso: -6,
    head: 25,
    near: { ...ALL_FOURS, reach: { floor: 285 }, bend: 1 },
    highlight: ['torso'],
  },
  'thoracic-rotation': {
    front: true,
    floor: false,
    torso: 0,
    head: 0,
    near: { leg: [120, 180], foot: 180, arm: [-95, -100] },
    far: { leg: [125, 180], foot: 180, arm: [80, 85] },
    highlight: ['torso', 'near.upperArm'],
  },
  'thread-the-needle': {
    torso: 14,
    head: 35,
    near: { ...ALL_FOURS, reach: { floor: -30 }, bend: -1 },
    far: { reach: { floor: 300 }, bend: 1 },
    highlight: ['near.upperArm', 'torso'],
  },
  'childs-pose': {
    torso: 10,
    head: 22,
    near: { leg: [32, 180], foot: 180, reach: { floor: 430 }, bend: 1 },
    highlight: ['torso'],
  },
  cobra: {
    torso: -32,
    head: -45,
    near: { leg: [178, 180], foot: 180, reach: { floor: 95 }, bend: 1 },
    highlight: ['torso'],
  },
  camel: {
    torso: -112,
    head: -160,
    near: { ...KNEEL, leg: [80, 180], reach: 'near.ankle', bend: -1 },
    highlight: ['torso', 'near.thigh'],
  },
  'supine-twist': {
    front: true,
    floor: false,
    torso: 0,
    head: 0,
    near: { leg: [80, 180], foot: 180, arm: [-90, -90] },
    far: { leg: [180, 180], foot: 90, arm: [90, 90] },
    highlight: ['torso', 'near.thigh'],
  },
  'standing-side-bend': {
    front: true,
    torso: -72,
    head: -62,
    near: { ...FRONT_STAND.near, arm: [95, 92] },
    far: { ...FRONT_STAND.far, arm: [-95, -45] },
    highlight: ['torso', 'far.upperArm'],
  },
  'knees-to-chest': {
    ...SUPINE,
    near: { leg: [-130, 10], foot: 10, reach: 'near.knee', bend: 1 },
    highlight: ['torso'],
  },
  diver: {
    torso: -42,
    head: 15,
    near: { leg: [72, 104], foot: 0, arm: [8, 8] },
    highlight: ['torso', 'neck'],
  },
  'jefferson-curl': {
    torso: 125,
    head: 110,
    near: { leg: [86, 92], foot: 0, reach: { floor: -110 }, bend: -1 },
    highlight: ['torso', 'near.thigh'],
  },
  'modified-seated-twist': {
    torso: -88,
    head: -80,
    near: { leg: [-55, 65], foot: 0, reach: 'near.knee', bend: -1 },
    far: { leg: [0, 0], foot: -80, reach: { floor: -90 }, bend: 1 },
    highlight: ['torso'],
  },

  // Hips & glutes
  pigeon: {
    torso: -80,
    near: { leg: [28, 168], foot: 170, reach: { floor: 70 }, bend: -1 },
    far: { leg: [168, 178], foot: 178, reach: { floor: 40 }, bend: -1 },
    highlight: ['near.thigh'],
  },
  '90-90': {
    torso: -85,
    near: { leg: [10, 100], foot: 10, reach: { floor: 120 }, bend: -1 },
    far: { leg: [172, 80], foot: 170, reach: { floor: -60 }, bend: 1 },
    highlight: ['near.thigh'],
  },
  'figure-four': {
    ...SUPINE,
    far: { leg: [-55, 70], foot: 0, reach: 'far.knee', bend: 1 },
    near: { footTo: 'far.knee', legBend: -1, foot: -40, reach: 'far.knee', bend: 1 },
    highlight: ['near.thigh'],
  },
  lizard: {
    torso: 18,
    head: 15,
    near: { leg: [22, 92], foot: 0, reach: { floor: 260 }, bend: 1 },
    far: { leg: [155, 178], foot: 180, reach: { floor: 230 }, bend: 1 },
    highlight: ['near.thigh', 'far.thigh'],
  },
  'hip-cars': {
    torso: -4,
    head: 15,
    near: { leg: [170, 95], foot: 180, reach: { floor: 285 }, bend: 1 },
    far: { ...ALL_FOURS, reach: { floor: 285 }, bend: 1 },
    highlight: ['near.thigh'],
  },
  'happy-baby': {
    ...SUPINE,
    near: { leg: [-125, -88], foot: 0, reach: 'near.ankle', bend: 1 },
    highlight: ['near.thigh'],
  },
  'deep-squat': {
    torso: -68,
    head: -72,
    near: { leg: [-12, 106], foot: 0, arm: [40, -50] },
    highlight: ['near.thigh'],
  },

  // Quads & hip flexors
  'hip-flexor': {
    torso: -90,
    near: { leg: [112, 180], foot: 180, reach: 'far.knee', bend: -1 },
    far: { leg: [5, 90], foot: 0 },
    highlight: ['near.thigh'],
  },
  'deep-split-squat': {
    torso: -88,
    near: { leg: [118, 172], foot: 175, reach: 'far.knee', bend: -1 },
    far: { leg: [-12, 92], foot: 0 },
    highlight: ['near.thigh'],
  },

  'couch-stretch': {
    torso: -84,
    near: { leg: [102, -90], foot: -90, reach: 'far.knee', bend: -1 },
    far: { leg: [8, 90], foot: 0 },
    props: [{ type: 'wall', at: 'near.knee', side: 'left' }],
    highlight: ['near.thigh'],
  },
  'standing-quad': {
    torso: -90,
    near: { leg: [118, -122], foot: -40, reach: 'near.ankle', bend: 1 },
    far: { ...STAND, ...HANG },
    highlight: ['near.thigh'],
  },

  // Hamstrings
  'seated-forward-fold': {
    torso: -28,
    head: -18,
    near: { leg: [0, 0], foot: -80, reach: 'near.toe', bend: 1 },
    highlight: ['near.thigh', 'near.shin'],
  },
  'standing-forward-fold': {
    torso: 118,
    head: 105,
    near: { leg: [84, 90], foot: 0, reach: { floor: -40 }, bend: -1 },
    highlight: ['near.thigh', 'near.shin'],
  },

  'half-split': {
    torso: -32,
    head: -25,
    near: { leg: [14, 14], foot: -75, reach: { floor: 150 }, bend: 1 },
    far: { leg: [95, 180], foot: 180, reach: { floor: 150 }, bend: 1 },
    highlight: ['near.thigh', 'near.shin'],
  },
  'head-to-knee': {
    torso: -24,
    head: -14,
    near: { leg: [0, 0], foot: -80, reach: 'near.toe', bend: 1 },
    far: { leg: [35, 165], foot: 170 },
    highlight: ['near.thigh', 'near.shin'],
  },
  'supine-hamstring': {
    ...SUPINE,
    near: { leg: [-95, -95], foot: 0, reach: 'near.knee', bend: 1 },
    far: { leg: [0, 0], foot: -80 },
    props: [{ type: 'band', from: 'near.hand', to: 'near.toe' }],
    highlight: ['near.thigh', 'near.shin'],
  },

  // Inner thighs
  pancake: {
    front: true,
    torso: -90,
    head: -90,
    near: { leg: [8, 8], foot: -80, reach: { floor: 110 }, bend: -1 },
    far: { leg: [172, 172], foot: -100, reach: { floor: -110 }, bend: 1 },
    highlight: ['near.thigh', 'far.thigh'],
  },
  frog: {
    torso: 8,
    head: 15,
    near: { leg: [100, 180], foot: 180, arm: [88, 0] },
    highlight: ['near.thigh', 'far.thigh'],
  },
  butterfly: {
    front: true,
    torso: -90,
    near: { leg: [22, 160], foot: 180, reach: 'near.ankle', bend: -1 },
    far: { leg: [158, 20], foot: 0, reach: 'far.ankle', bend: 1 },
    highlight: ['near.thigh', 'far.thigh'],
  },
  'cossack-squat': {
    front: true,
    torso: -82,
    near: { leg: [25, 100], foot: 10, reach: { x: 60, y: -150 }, bend: 1 },
    far: { leg: [162, 162], foot: -100, reach: { x: 40, y: -150 }, bend: -1 },
    highlight: ['far.thigh'],
  },
  'side-lunge': {
    front: true,
    torso: -84,
    near: { leg: [35, 98], foot: 10, reach: 'near.knee', bend: 1 },
    far: { leg: [138, 138], foot: 180, reach: 'near.knee', bend: -1 },
    highlight: ['far.thigh'],
  },

  // Calves & feet
  'wall-calf': {
    torso: -62,
    head: -60,
    near: { leg: [118, 118], foot: 0, reach: { x: 290, y: -250 }, bend: 1 },
    far: { leg: [72, 98], foot: 0 },
    props: [{ type: 'wall', at: 'near.hand', side: 'right' }],
    highlight: ['near.shin'],
  },
  'ankle-rocks': {
    torso: -88,
    near: { leg: [5, 112], foot: 0, reach: 'near.knee', bend: -1 },
    far: { leg: [100, 180], foot: 180 },
    highlight: ['near.shin'],
  },
  'toe-squat': {
    torso: -90,
    near: { leg: [8, 172], foot: 120, reach: 'near.knee', bend: -1 },
    highlight: ['near.foot'],
  },

  // Full body
  'worlds-greatest': {
    torso: 20,
    head: 0,
    near: { leg: [18, 94], foot: 0, arm: [-90, -90] },
    far: { leg: [158, 165], foot: 110, reach: { floor: 220 }, bend: 1 },
    highlight: ['torso', 'far.thigh'],
  },
  'downward-dog': {
    torso: 125,
    head: 118,
    near: { leg: [60, 60], foot: 175, reach: { floor: -330 }, bend: 1 },
    highlight: ['near.thigh', 'near.shin'],
  },
  'squat-to-stand': {
    torso: -40,
    head: -10,
    near: { leg: [-15, 108], foot: 0, reach: 'near.toe', bend: 1 },
    highlight: ['near.thigh'],
  },
}
