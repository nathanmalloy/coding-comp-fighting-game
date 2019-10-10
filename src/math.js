function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeIn(t) {
  return t * t
}

function easeOut(t) {
  return 1 - (1 - t) * (1 - t)
}

export { lerp, easeIn, easeOut }