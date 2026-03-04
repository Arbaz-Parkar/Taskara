const BACKEND_ORIGIN = "http://localhost:4000";
const API_BASE = `${BACKEND_ORIGIN}/api`;

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

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return {
    ...data,
    user: {
      ...data.user,
      avatarUrl: resolveMediaUrl(data.user?.avatarUrl),
    },
  };
};

const API = API_BASE;

export const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${BACKEND_ORIGIN}${value}`;
  }

  return `${BACKEND_ORIGIN}/${value}`;
};

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderMessage = {
  id: number;
  orderId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  attachments?: {
    id: number;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
  }[];
};

export type PublicUserProfile = {
  id: number;
  name: string;
  avatarUrl?: string | null;
  title?: string | null;
  email: string;
  createdAt: string;
  activeServicesCount: number;
  providerProfile: {
    bio: string | null;
    experienceYears: number | null;
    baseHourlyRate: number | null;
    serviceRadiusKm: number | null;
    averageRating: number;
    totalReviews: number;
    verified: boolean;
  } | null;
};

export type PublicUserService = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: number;
    name: string;
  };
};

export type UserReview = {
  id: number;
  orderId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment: string | null;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  reviewee?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  order: {
    id: number;
    service: {
      id: number;
      title: string;
    };
  };
};

export type MySettings = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  title: string | null;
  country: string | null;
  timezone: string;
  language: string;
  currency: string;
  emailNotifications: boolean;
  orderNotifications: boolean;
  messageNotifications: boolean;
  marketingNotifications: boolean;
  profileVisibility: string;
  showOnlineStatus: boolean;
  createdAt: string;
  providerProfile: {
    bio: string | null;
    experienceYears: number | null;
    baseHourlyRate: number | null;
    serviceRadiusKm: number | null;
    verified: boolean;
    averageRating: number;
    totalReviews: number;
  } | null;
};

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

export const createOrder = async (data: {
  serviceId: number;
  requirements?: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to create order");
  return result;
};

export const fetchBuyerOrders = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/buyer`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch buyer orders");
  return result;
};

export const fetchSellerOrders = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/seller`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch seller orders");
  return result;
};

export const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to update order");
  return result;
};

export const fetchOrderMessages = async (orderId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/${orderId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to load messages");
  return result as OrderMessage[];
};

export const sendOrderMessage = async (
  orderId: number,
  payload: {
    content?: string;
    attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
  }
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/${orderId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send message");
  return result as OrderMessage;
};

export const fetchServiceById = async (id: string) => {
  const res = await fetch(`${API}/services/${id}`);
  if (!res.ok) throw new Error("Service not found");
  return res.json();
};

export const fetchPublicUserProfile = async (userId: number | string) => {
  const res = await fetch(`${API}/users/${userId}`);
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to load user profile");
  }

  return {
    ...(result as PublicUserProfile),
    avatarUrl: resolveMediaUrl(result.avatarUrl),
  } as PublicUserProfile;
};

export const fetchPublicUserServices = async (userId: number | string) => {
  const res = await fetch(`${API}/users/${userId}/services`);
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to load user services");
  }

  return result as PublicUserService[];
};

export const fetchPublicUserReviews = async (userId: number | string) => {
  const res = await fetch(`${API}/users/${userId}/reviews`);
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to load user reviews");
  }

  return (result as UserReview[]).map((review) => ({
    ...review,
    reviewer: {
      ...review.reviewer,
      avatarUrl: resolveMediaUrl(review.reviewer?.avatarUrl),
    },
    reviewee: review.reviewee
      ? {
          ...review.reviewee,
          avatarUrl: resolveMediaUrl(review.reviewee.avatarUrl),
        }
      : undefined,
  }));
};

export const createReview = async (data: {
  orderId: number;
  rating: number;
  comment?: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create review");
  }

  return result as UserReview;
};

export const fetchMyWrittenReviews = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews/mine/written`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch written reviews");
  }

  return (result as UserReview[]).map((review) => ({
    ...review,
    reviewer: {
      ...review.reviewer,
      avatarUrl: resolveMediaUrl(review.reviewer?.avatarUrl),
    },
    reviewee: review.reviewee
      ? {
          ...review.reviewee,
          avatarUrl: resolveMediaUrl(review.reviewee.avatarUrl),
        }
      : undefined,
  }));
};

export const fetchMyReceivedReviews = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews/mine/received`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch received reviews");
  }

  return (result as UserReview[]).map((review) => ({
    ...review,
    reviewer: {
      ...review.reviewer,
      avatarUrl: resolveMediaUrl(review.reviewer?.avatarUrl),
    },
    reviewee: review.reviewee
      ? {
          ...review.reviewee,
          avatarUrl: resolveMediaUrl(review.reviewee.avatarUrl),
        }
      : undefined,
  }));
};

export const updateMyWrittenReview = async (
  reviewId: number,
  data: {
    rating?: number;
    comment?: string;
  }
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update review");
  }

  const review = result as UserReview;

  return {
    ...review,
    reviewer: {
      ...review.reviewer,
      avatarUrl: resolveMediaUrl(review.reviewer?.avatarUrl),
    },
    reviewee: review.reviewee
      ? {
          ...review.reviewee,
          avatarUrl: resolveMediaUrl(review.reviewee.avatarUrl),
        }
      : undefined,
  };
};

export const deleteMyWrittenReview = async (reviewId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to delete review");
  }

  return result as { message: string };
};

export const replyToReceivedReview = async (reviewId: number, reply: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/reviews/${reviewId}/reply`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reply }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to reply to review");
  }

  const review = result as UserReview;

  return {
    ...review,
    reviewer: {
      ...review.reviewer,
      avatarUrl: resolveMediaUrl(review.reviewer?.avatarUrl),
    },
    reviewee: review.reviewee
      ? {
          ...review.reviewee,
          avatarUrl: resolveMediaUrl(review.reviewee.avatarUrl),
        }
      : undefined,
  };
};

export const fetchMySettings = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to load settings");
  }

  return {
    ...(result as MySettings),
    avatarUrl: resolveMediaUrl(result.avatarUrl),
  } as MySettings;
};

export const updateMyProfileSettings = async (data: {
  name?: string;
  phone?: string | null;
  title?: string | null;
  country?: string | null;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update profile");
  }

  return result;
};

export const updateMyAvatarSettings = async (data: {
  fileName: string;
  mimeType: string;
  dataBase64: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/avatar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update avatar");
  }

  return {
    ...(result as { id: number; avatarUrl: string | null }),
    avatarUrl: resolveMediaUrl(result.avatarUrl),
  };
};

export const updateMyProviderProfileSettings = async (data: {
  bio?: string | null;
  experienceYears?: number | null;
  baseHourlyRate?: number | null;
  serviceRadiusKm?: number | null;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/provider-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update seller profile");
  }

  return result;
};

export const updateMyPreferencesSettings = async (data: {
  timezone?: string;
  language?: string;
  currency?: string;
  emailNotifications?: boolean;
  orderNotifications?: boolean;
  messageNotifications?: boolean;
  marketingNotifications?: boolean;
  profileVisibility?: string;
  showOnlineStatus?: boolean;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update preferences");
  }

  return result;
};

export const updateMyPasswordSettings = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/security/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update password");
  }

  return result as { message: string };
};

export const exportMyAccountData = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/export`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to export account data");
  }

  return result as Record<string, unknown>;
};

export const deactivateMyAccount = async (currentPassword: string) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me/deactivate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to deactivate account");
  }

  return result as { message: string };
};

export const deleteMyAccount = async (
  currentPassword: string,
  confirmationText: string
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, confirmationText }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to delete account");
  }

  return result as { message: string };
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
