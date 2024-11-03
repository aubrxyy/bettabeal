interface CookieOptions {
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  expires?: Date;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === 'undefined') {
    return;
  }

  let cookieString = `${name}=${value}; path=/`;

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  } else if (options.maxAge) {
    const expires = new Date(Date.now() + options.maxAge * 1000).toUTCString();
    cookieString += `; expires=${expires}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }
  
  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}