const ADMIN_EMAIL = "admin@taskara.com";

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const setAuthIdentity = (email?: string, role?: string) => {
  if (email) {
    localStorage.setItem("auth_email", email);
  }

  if (role) {
    localStorage.setItem("auth_role", role);
  }
};

const decodeJwtPayload = (token: string) => {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return null;
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as { email?: string; role?: string };
  } catch {
    return null;
  }
};

export const isAdminAccount = () => {
  const email = localStorage.getItem("auth_email");
  const role = localStorage.getItem("auth_role");

  if (email && role) {
    return email.toLowerCase() === ADMIN_EMAIL && role.toLowerCase() === "admin";
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.email || !payload.role) {
    return false;
  }

  return (
    payload.email.toLowerCase() === ADMIN_EMAIL &&
    payload.role.toLowerCase() === "admin"
  );
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth_email");
  localStorage.removeItem("auth_role");
};
