const KEY = 'app_session_id';

export function getAppSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = window.localStorage.getItem(KEY);
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return '';
  }
}
