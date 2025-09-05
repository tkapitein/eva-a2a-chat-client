import { A2AClient } from "@a2a-js/sdk/client";

let clientPromise: Promise<A2AClient> | null = null;

const DEFAULT_CARD_URL = "http://localhost:9999/.well-known/agent-card.json";
let customFetchImpl: typeof fetch | undefined;
let customCardUrl: string | undefined;
let authorizationToken: string | undefined;

export function setA2AFetchImpl(fetchImpl: typeof fetch) {
  customFetchImpl = fetchImpl;
  clientPromise = null; // reset so new impl is used on next get
}

export function setA2ACardUrl(url: string) {
  customCardUrl = url;
  clientPromise = null; // reset so new url is used on next get
}

export function setA2AAuthorizationToken(token: string | undefined) {
  authorizationToken = token;
  clientPromise = null; // reset so new client is created with updated auth
}

export function getA2AAuthorizationToken(): string | undefined {
  return authorizationToken;
}

function createFetchWithAuth(token?: string): typeof fetch {
  return async (url, init) => {
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("Authorization", `eva ${token}`);
    }

    const newInit = { ...init, headers };

    // Use custom fetch if provided, otherwise use global fetch
    const baseFetch = customFetchImpl || fetch;
    return baseFetch(url, newInit);
  };
}

export function getA2AClient(): Promise<A2AClient> {
  if (!clientPromise) {
    const cardUrl = customCardUrl ?? DEFAULT_CARD_URL;

    // Create fetch implementation with auth if token is set
    const fetchImpl = authorizationToken
      ? createFetchWithAuth(authorizationToken)
      : customFetchImpl;

    clientPromise = A2AClient.fromCardUrl(cardUrl, {
      fetchImpl,
    });
  }
  return clientPromise;
}

export async function cancelA2ATask(_taskId: string): Promise<boolean> {
  try {
    // A2A task cancellation would typically be done via a DELETE request
    // to the task endpoint, but this depends on the server implementation
    
    // Since the A2A client doesn't have a direct cancelTask method,
    // we would need to implement this based on the server's API
    // For now, return false to indicate cancellation is not yet supported
    console.warn('Task cancellation not yet implemented on client side');
    return false;
  } catch (error) {
    console.error('Failed to cancel task:', error);
    return false;
  }
}
