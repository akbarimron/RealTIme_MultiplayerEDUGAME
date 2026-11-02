export function getDeviceId() {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem('KS_DEVICE_ID');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('KS_DEVICE_ID', id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).slice(2, 9);
  }
}
