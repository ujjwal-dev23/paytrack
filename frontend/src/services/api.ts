const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export const apiFetch = async <TResponse = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TResponse> => {
  const { data, ...customConfig } = options;
  const headers = { "Content-Type": "application/json" };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    credentials: "include", // Required for cookies
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null as TResponse;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result as TResponse;
};
