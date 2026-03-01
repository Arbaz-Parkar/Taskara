const API_BASE = "http://localhost:4000/api";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:4000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data;
};

const API = "http://localhost:4000/api";

export const fetchServices = async () => {
  const res = await fetch(`${API}/services`);
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
};

export const fetchMyServices = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch your services");
  return res.json();
};

export const updateMyService = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
  }
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to update service");
  return result;
};

export const updateMyServiceStatus = async (id: number, isActive: boolean) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to update status");
  return result;
};

export const deleteMyService = async (id: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to delete service");
  return result;
};

export const fetchServiceById = async (id: string) => {
  const res = await fetch(`${API}/services/${id}`);
  if (!res.ok) throw new Error("Service not found");
  return res.json();
};

export const createService = async (data: {
  title: string;
  description: string;
  category: string;
  price: number;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create service");
  }

  return result;
};
