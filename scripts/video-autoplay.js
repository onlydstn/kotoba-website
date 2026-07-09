export function shouldPlay(isIntersecting, prefersReducedMotion) {
  return isIntersecting && !prefersReducedMotion;
}
