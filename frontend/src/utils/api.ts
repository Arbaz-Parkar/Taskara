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

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export type DisputeTimelineEvent = {
  key: string;
  type: "DISPUTE_OPENED" | "STATUS_UPDATED" | "MESSAGE_POSTED";
  status: DisputeStatus;
  at: string;
  actor: {
    id: number;
    name: string;
  };
  label: string;
};

export type DisputeMessage = {
  id: number;
  disputeId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    role?: {
      name: string;
    };
  };
  attachments?: {
    id: number;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
  }[];
};

export type DisputeRecord = {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  raisedById: number;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  order: {
    id: number;
    status: OrderStatus;
    amount: number;
    service: {
      id: number;
      title: string;
      category: string;
    };
  };
  buyer: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  seller: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  raisedBy: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  messages?: DisputeMessage[];
  timeline?: DisputeTimelineEvent[];
};

export type EligibleDisputeOrder = {
  id: number;
  status: OrderStatus;
  amount: number;
  updatedAt: string;
  service: {
    id: number;
    title: string;
    category: string;
  };
  buyer: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  seller: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  dispute: {
    id: number;
    status: DisputeStatus;
    createdAt: string;
  } | null;
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
  images?: {
    id: number;
    fileUrl: string;
    sortOrder: number;
  }[];
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

export type AppNotification = {
  id: number;
  type: "ORDER_ACCEPTED" | "ORDER_DELIVERED" | "REVIEW_RECEIVED" | "REVIEW_REPLY_POSTED";
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  } | null;
};

export type AdminUserRecord = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  role: {
    name: string;
  };
  _count: {
    services: number;
    buyerOrders: number;
    sellerOrders: number;
    reviewsReceived: number;
  };
};

export type AdminServiceRecord = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  sellerId: number;
  seller: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    orders: number;
  };
  images?: {
    id: number;
    fileUrl: string;
    sortOrder: number;
  }[];
};

export type ServiceImagePayload = {
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  dataBase64?: string;
};

export type AdminReports = {
  totals: {
    users: number;
    activeUsers: number;
    inactiveUsers: number;
    services: number;
    activeServices: number;
    inactiveServices: number;
    orders: number;
    reviews: number;
  };
  orderStatus: {
    PENDING: number;
    ACCEPTED: number;
    IN_PROGRESS: number;
    DELIVERED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  recentUsers: {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
  }[];
  recentServices: {
    id: number;
    title: string;
    isActive: boolean;
    createdAt: string;
    seller: {
      id: number;
      name: string;
      email: string;
    };
  }[];
  recentOrders: {
    id: number;
    status: OrderStatus;
    amount: number;
    createdAt: string;
    service: {
      id: number;
      title: string;
    };
    buyer: {
      id: number;
      name: string;
    };
    seller: {
      id: number;
      name: string;
    };
  }[];
};

export type AdminOrderRecord = {
  id: number;
  status: OrderStatus;
  amount: number;
  requirements?: string | null;
  createdAt: string;
  service: {
    id: number;
    title: string;
    category: string;
  };
  buyer: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  seller: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
};

export type AdminDisputeRecord = {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  raisedById: number;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  order: {
    id: number;
    status: OrderStatus;
    amount: number;
    service: {
      id: number;
      title: string;
      category: string;
    };
  };
  buyer: {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  seller: {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  raisedBy: {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
  };
  messages?: {
    id: number;
    content: string;
    createdAt: string;
    sender: {
      id: number;
      name: string;
      avatarUrl?: string | null;
    };
  }[];
};

export type ServiceSearchParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  responseSpeed?: "FAST" | "DAY" | "SLOW";
  sort?:
    | "BEST_MATCH"
    | "PRICE_LOW_HIGH"
    | "PRICE_HIGH_LOW"
    | "RATING_HIGH_LOW"
    | "RESPONSE_FAST";
};

export const fetchServices = async (params: ServiceSearchParams = {}) => {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (typeof params.minPrice === "number") query.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") query.set("maxPrice", String(params.maxPrice));
  if (typeof params.minRating === "number") query.set("minRating", String(params.minRating));
  if (params.responseSpeed) query.set("responseSpeed", params.responseSpeed);
  if (params.sort) query.set("sort", params.sort);

  const querySuffix = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(`${API}/services${querySuffix}`);
  if (!res.ok) throw new Error("Failed to fetch services");
  const result = await res.json();
  return (result as any[]).map((service) => ({
    ...service,
    images: (service.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  }));
};

export const fetchMyServices = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error("Failed to fetch your services");
  return (result as any[]).map((service) => ({
    ...service,
    images: (service.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  }));
};

export const updateMyService = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    images?: ServiceImagePayload[];
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
  return {
    ...result,
    images: (result.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  };
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
  return {
    ...result,
    images: (result.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  };
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

export const fetchEligibleDisputeOrders = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/mine/orders-eligible`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to load eligible orders");
  return (result as EligibleDisputeOrder[]).map((order) => ({
    ...order,
    buyer: {
      ...order.buyer,
      avatarUrl: resolveMediaUrl(order.buyer.avatarUrl),
    },
    seller: {
      ...order.seller,
      avatarUrl: resolveMediaUrl(order.seller.avatarUrl),
    },
  }));
};

export const fetchMyDisputes = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to load disputes");
  return (result as DisputeRecord[]).map((dispute) => ({
    ...dispute,
    buyer: {
      ...dispute.buyer,
      avatarUrl: resolveMediaUrl(dispute.buyer.avatarUrl),
    },
    seller: {
      ...dispute.seller,
      avatarUrl: resolveMediaUrl(dispute.seller.avatarUrl),
    },
    raisedBy: {
      ...dispute.raisedBy,
      avatarUrl: resolveMediaUrl(dispute.raisedBy.avatarUrl),
    },
  }));
};

export const createDispute = async (payload: {
  orderId: number;
  reason: string;
  message?: string;
  attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to create dispute");

  const dispute = result as DisputeRecord;
  return {
    ...dispute,
    buyer: {
      ...dispute.buyer,
      avatarUrl: resolveMediaUrl(dispute.buyer.avatarUrl),
    },
    seller: {
      ...dispute.seller,
      avatarUrl: resolveMediaUrl(dispute.seller.avatarUrl),
    },
    raisedBy: {
      ...dispute.raisedBy,
      avatarUrl: resolveMediaUrl(dispute.raisedBy.avatarUrl),
    },
    messages:
      dispute.messages?.map((message) => ({
        ...message,
        sender: {
          ...message.sender,
          avatarUrl: resolveMediaUrl(message.sender.avatarUrl),
        },
      })) ?? [],
  };
};

export const fetchDisputeById = async (disputeId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/${disputeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to load dispute");

  const dispute = result as DisputeRecord & { messages: DisputeMessage[] };
  return {
    ...dispute,
    buyer: {
      ...dispute.buyer,
      avatarUrl: resolveMediaUrl(dispute.buyer.avatarUrl),
    },
    seller: {
      ...dispute.seller,
      avatarUrl: resolveMediaUrl(dispute.seller.avatarUrl),
    },
    raisedBy: {
      ...dispute.raisedBy,
      avatarUrl: resolveMediaUrl(dispute.raisedBy.avatarUrl),
    },
    messages: dispute.messages.map((message) => ({
      ...message,
      sender: {
        ...message.sender,
        avatarUrl: resolveMediaUrl(message.sender.avatarUrl),
      },
      attachments: (message.attachments ?? []).map((attachment) => ({
        ...attachment,
        fileUrl: resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl,
      })),
    })),
  };
};

export const fetchDisputeMessages = async (disputeId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/${disputeId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to load dispute messages");
  return (result as DisputeMessage[]).map((message) => ({
    ...message,
    sender: {
      ...message.sender,
      avatarUrl: resolveMediaUrl(message.sender.avatarUrl),
    },
    attachments: (message.attachments ?? []).map((attachment) => ({
      ...attachment,
      fileUrl: resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl,
    })),
  }));
};

export const sendDisputeMessage = async (
  disputeId: number,
  payload: {
    content?: string;
    attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
  }
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/${disputeId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to send dispute message");

  const message = result as DisputeMessage;
  return {
    ...message,
    sender: {
      ...message.sender,
      avatarUrl: resolveMediaUrl(message.sender.avatarUrl),
    },
    attachments: (message.attachments ?? []).map((attachment) => ({
      ...attachment,
      fileUrl: resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl,
    })),
  };
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
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Service not found");
  return {
    ...result,
    images: (result.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  };
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

  return (result as PublicUserService[]).map((service) => ({
    ...service,
    images: (service.images ?? []).map((image) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl) ?? image.fileUrl,
    })),
  }));
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

export const fetchMyNotifications = async (limit = 40) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/notifications/mine?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to load notifications");
  }

  const data = result as { items: AppNotification[]; unreadCount: number };

  return {
    items: data.items.map((notification) => ({
      ...notification,
      actor: notification.actor
        ? {
            ...notification.actor,
            avatarUrl: resolveMediaUrl(notification.actor.avatarUrl),
          }
        : null,
    })),
    unreadCount: data.unreadCount,
  };
};

export const markNotificationRead = async (notificationId: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to mark notification as read");
  }

  return result as { message: string };
};

export const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/notifications/mine/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to mark notifications as read");
  }

  return result as { message: string };
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

export const fetchAdminUsers = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch users");
  }

  return result as AdminUserRecord[];
};

export const updateAdminUserStatus = async (
  userId: number,
  isActive: boolean
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update user status");
  }

  return result as { id: number; isActive: boolean };
};

export const fetchAdminServices = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/admin/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch services");
  }

  return (result as AdminServiceRecord[]).map((service) => ({
    ...service,
    images: (service.images ?? []).map((image) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl) ?? image.fileUrl,
    })),
  }));
};

export const updateAdminServiceStatus = async (
  serviceId: number,
  isActive: boolean
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/admin/${serviceId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update service status");
  }

  return result as AdminServiceRecord;
};

export const deleteAdminService = async (serviceId: number) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/services/admin/${serviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to delete service");
  }

  return result as { message: string };
};

export const fetchAdminReports = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/users/admin/reports`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch reports");
  }

  return result as AdminReports;
};

export const fetchAdminOrders = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/admin/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch orders");
  }

  return result as AdminOrderRecord[];
};

export const updateAdminOrderStatus = async (
  orderId: number,
  status: OrderStatus
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/orders/admin/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update order status");
  }

  return result as AdminOrderRecord;
};

export const fetchAdminDisputes = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/admin/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch disputes");
  }

  return (result as AdminDisputeRecord[]).map((dispute) => ({
    ...dispute,
    buyer: {
      ...dispute.buyer,
      avatarUrl: resolveMediaUrl(dispute.buyer.avatarUrl),
    },
    seller: {
      ...dispute.seller,
      avatarUrl: resolveMediaUrl(dispute.seller.avatarUrl),
    },
    raisedBy: {
      ...dispute.raisedBy,
      avatarUrl: resolveMediaUrl(dispute.raisedBy.avatarUrl),
    },
    messages:
      dispute.messages?.map((message) => ({
        ...message,
        sender: {
          ...message.sender,
          avatarUrl: resolveMediaUrl(message.sender.avatarUrl),
        },
      })) ?? [],
  }));
};

export const updateAdminDisputeStatus = async (
  disputeId: number,
  status: DisputeStatus
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/disputes/admin/${disputeId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to update dispute status");
  }

  const dispute = result as AdminDisputeRecord;
  return {
    ...dispute,
    buyer: {
      ...dispute.buyer,
      avatarUrl: resolveMediaUrl(dispute.buyer.avatarUrl),
    },
    seller: {
      ...dispute.seller,
      avatarUrl: resolveMediaUrl(dispute.seller.avatarUrl),
    },
    raisedBy: {
      ...dispute.raisedBy,
      avatarUrl: resolveMediaUrl(dispute.raisedBy.avatarUrl),
    },
  };
};

export const createService = async (data: {
  title: string;
  description: string;
  category: string;
  price: number;
  images?: ServiceImagePayload[];
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

  return {
    ...result,
    images: (result.images ?? []).map((image: any) => ({
      ...image,
      fileUrl: resolveMediaUrl(image.fileUrl),
    })),
  };
};
