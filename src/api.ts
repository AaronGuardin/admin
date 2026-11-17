import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
};

export type Overview = {
  stats: {
    users: number;
    producers: number;
    beats: number;
    publishedBeats: number;
  };
  recentBeats: {
    id: string;
    title: string;
    genre: string;
    price: number;
    published: boolean;
    createdAt: string;
    producer: { name: string };
  }[];
};

export async function login(email: string, password: string) {
  const { data } = await api.post<{ user: AdminUser }>("/auth/login", {
    email,
    password,
  });

  if (data.user.role !== "ADMIN") {
    await api.delete("/auth/logout");
    throw new Error("This account does not have administrator access.");
  }
  return data.user;
}

export async function getCurrentUser() {
  const { data } = await api.get<{ user: AdminUser }>("/auth/me");
  if (data.user.role !== "ADMIN") {
    throw new Error("This account does not have administrator access.");
  }
  return data.user;
}

export async function getOverview() {
  const { data } = await api.get<{ data: Overview }>("/admin/overview");
  return data.data;
}

export async function logout() {
  await api.delete("/auth/logout");
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return (
      error.response?.data?.error ??
      "The API could not be reached. Check that it is running."
    );
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
