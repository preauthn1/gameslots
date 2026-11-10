let remembered = null;

export function rememberActivity(item) {
  remembered = item || null;
}

export function readActivity(id) {
  if (!remembered) return null;
  const currentId = remembered.id || remembered.activityId || remembered.activityCode;
  return String(currentId) === String(id) ? remembered : null;
}
