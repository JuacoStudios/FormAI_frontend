const KEY = "formai:userId";
const EMAIL_KEY = "formai:userEmail";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function getIdentity() {
  if (typeof window === "undefined") return { userId: "server-render", email: "" };
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(KEY, id);
  }
  const email = window.localStorage.getItem(EMAIL_KEY) || "";
  return { userId: id, email };
}

export function setUserEmail(email: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(EMAIL_KEY, email || "");
  }
}

// Legacy async functions for compatibility
export async function getOrCreateUserId(): Promise<string> {
  return getIdentity().userId;
}

export async function getUserEmail(): Promise<string | null> {
  return getIdentity().email || null;
}
