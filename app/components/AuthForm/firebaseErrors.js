const FRIENDLY_ERRORS = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Enter your password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled. Contact support.",
};

export function friendlyAuthError(err) {
  const code = err?.code || (typeof err?.message === "string" ? err.message : "");
  if (FRIENDLY_ERRORS[code]) return FRIENDLY_ERRORS[code];
  if (code.includes("Firebase: Error")) return "Something went wrong. Please try again.";
  return code || "Something went wrong. Please try again.";
}
