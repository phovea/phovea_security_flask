
import {on, off} from 'phovea_core/src/event';
import {GLOBAL_EVENT_AJAX_POST_SEND, send} from 'phovea_core/src/ajax';
import {offline} from 'phovea_core/src/index';
import {GLOBAL_EVENT_USER_LOGGED_IN, GLOBAL_EVENT_USER_LOGGED_OUT, isLoggedIn} from 'phovea_core/src/security';
import {loggedInAs, logout as globalLogout} from './login';

const DEFAULT_SESSION_TIMEOUT = 10 * 60 * 1000; // 10 min

export class SessionWatcher {
  private timeout = -1;
  private lastChecked = 0;

  constructor(private readonly logout: () => any = globalLogout) {
    on(GLOBAL_EVENT_USER_LOGGED_IN, () => this.reset());
    if (isLoggedIn()) {
      this.reset();
    }
    on(GLOBAL_EVENT_USER_LOGGED_OUT, () => this.stop());
    on(GLOBAL_EVENT_AJAX_POST_SEND, () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkSession();
      }
    });
  }

  private checkSession() {
    const now = Date.now();
    if ((now - this.lastChecked) < DEFAULT_SESSION_TIMEOUT) {
      // too early assume good
      return;
    }

    loggedInAs()
      .then(() => this.reset())
      .catch(() => this.loggedOut());
  }

  private loggedOut() {
    if (!isLoggedIn()) {
      return;
    }

    // force log out
    this.logout();
  }

  private stop() {
    if (this.timeout >= 0) {
      clearTimeout(this.timeout);
      this.timeout = -1;
    }
    this.lastChecked = 0;
  }

  private reset() {
    if (this.timeout >= 0) {
      clearTimeout(this.timeout);
      this.timeout = -1;
    }
    this.lastChecked = Date.now();

    if (isLoggedIn()) {
      this.timeout = self.setTimeout(() => this.checkSession(), DEFAULT_SESSION_TIMEOUT + 100);
    }
  }
}

/**
 * watches for session auto log out scenarios
 */
export default function startWatching(logout: () => any = globalLogout) {
  if (offline) {
    return;
  }
  const _ = new SessionWatcher(logout);
}
