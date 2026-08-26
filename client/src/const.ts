export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// GitHub Pages publishes the frontend without the Manus backend environment.
// Keep URL construction safe in that static mode instead of passing an empty
// value to the URL constructor during React rendering.
const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL?.trim();
const appId = import.meta.env.VITE_APP_ID?.trim();
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");
export const apiBaseUrl = configuredApiBaseUrl && /^https?:\/\//i.test(configuredApiBaseUrl)
  ? configuredApiBaseUrl
  : "";
export const isOAuthConfigured = Boolean(oauthPortalUrl && appId && apiBaseUrl);

export const getLoginUrl = () => {
  const unavailableUrl = `${window.location.origin}${window.location.pathname}?auth=unavailable`;
  if (!isOAuthConfigured || !oauthPortalUrl || !appId) return unavailableUrl;

  const redirectOrigin = apiBaseUrl || window.location.origin;
  const redirectUri = `${redirectOrigin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  try {
    const url = new URL("/app-auth", oauthPortalUrl);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch {
    return unavailableUrl;
  }
};
