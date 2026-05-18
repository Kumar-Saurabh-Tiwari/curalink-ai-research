/**
 * ============================================================================
 *  Curalink — Chat API Service Layer
 * ----------------------------------------------------------------------------
 *  All network requests for the chat / research assistant feature live here.
 *  This file is intentionally framework-free (plain `fetch`) so the backend
 *  team can wire it to any HTTP server without touching React components.
 *
 *  Host configuration:
 *    - Reads `VITE_API_BASE_URL` from the Vite environment.
 *    - Falls back to `http://localhost:5000` for local development.
 *
 *  Patient / user context:
 *    The medical context fields (`patientName`, `disease`, `additionalQuery`,
 *    `location`) are read automatically from the signed-in user's profile via
 *    `getUserContext()`. UI components do NOT need to pass them manually —
 *    just call `sendChatMessage({ sessionId, message })` and the helper will
 *    enrich the payload from `localStorage` ("curalink:user").
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** @type {string} Base URL for all backend requests. */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:5000";

const USER_STORAGE_KEY = "curalink:user";
const TOKEN_STORAGE_KEY = "curalink:token";

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {}
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

/**
 * Reads the signed-in user from localStorage and extracts the medical
 * context fields used by every chat request.
 *
 * The user object is expected to look like:
 * {
 *   name:            string,
 *   email:           string,
 *   patientName?:    string,
 *   disease?:        string,
 *   additionalQuery?:string,
 *   location?:       string
 * }
 *
 * @returns {{
 *   patientName: string,
 *   disease: string,
 *   additionalQuery: string,
 *   location?: string
 * }}
 */
export function getUserContext() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return { patientName: "", disease: "", additionalQuery: "" };
    const u = JSON.parse(raw) || {};
    const ctx = {
      patientName: u.patientName || u.name || "",
      disease: u.disease || "",
      additionalQuery: u.additionalQuery || "",
    };
    if (u.location) ctx.location = u.location;
    return ctx;
  } catch {
    return { patientName: "", disease: "", additionalQuery: "" };
  }
}

/**
 * Internal helper — performs a JSON fetch and throws on non-2xx responses.
 *
 * @param {string} path        Endpoint path (joined with API_BASE_URL).
 * @param {RequestInit} [init] Standard fetch init.
 * @returns {Promise<any>}
 */
async function request(path, init = {}) {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    // @ts-ignore
    err.status = res.status;
    // @ts-ignore
    err.data = data;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * Sends a chat message to the backend.
 *
 * Endpoint: POST `${API_BASE_URL}/api/chat/message`
 *
 * Request Payload (JSON):
 * {
 *   "sessionId": "string  // unique conversation/thread ID",
 *   "message":   "string  // the current user message",
 *   "context": {
 *     "patientName":     "string",
 *     "disease":         "string",
 *     "additionalQuery": "string",
 *     "location":        "string  // optional"
 *   }
 * }
 *
 * Expected Response (JSON):
 * {
 *   "success":   true,
 *   "reply":     "string   // assistant response text",
 *   "timestamp": "string   // ISO-8601 datetime",
 *   "sources":   [ { id, source, title, journal?, date?, doi?, url? } ],   // optional
 *   "trials":    [ { id, name, phase, participants, status, condition } ], // optional
 *   "evidenceScore": 0-100  // optional
 * }
 *
 * @param {Object} payload
 * @param {string} payload.sessionId         - Conversation ID for thread context.
 * @param {string} payload.message           - The text message sent by the user.
 * @param {Object} [payload.context]         - Optional override; defaults pulled from user profile.
 * @param {string} payload.context.patientName
 * @param {string} payload.context.disease
 * @param {string} payload.context.additionalQuery
 * @param {string} [payload.context.location]
 *
 * @returns {Promise<{ success: boolean, reply: string, timestamp: string,
 *                     sources?: any[], trials?: any[], evidenceScore?: number }>}
 */
export async function sendChatMessage({ sessionId, message, context }) {
  if (!sessionId) throw new Error("sendChatMessage: sessionId is required");
  if (!message)   throw new Error("sendChatMessage: message is required");

  const ctx = context || getUserContext();
  const body = {
    sessionId,
    message,
    patientName: ctx.patientName,
    disease: ctx.disease,
    additionalQuery: ctx.additionalQuery,
    location: ctx.location,
  };

  return request("/api/chat/message", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Fetches the full conversation history for a given session.
 *
 * Endpoint: GET `${API_BASE_URL}/api/chat/conversation/:sessionId`
 *
 * Expected Response (JSON):
 * {
 *   "success":   true,
 *   "sessionId": "string",
 *   "messages": [
 *     {
 *       "id":        "string",
 *       "role":      "user" | "assistant",
 *       "content":   "string",
 *       "timestamp": "string  // ISO-8601",
 *       "sources":   [...],   // optional
 *       "trials":    [...],   // optional
 *       "evidenceScore": 0-100 // optional
 *     }
 *   ]
 * }
 *
 * @param {string} sessionId - The conversation ID to fetch.
 * @returns {Promise<{ success: boolean, sessionId: string, messages: Array<Object> }>}
 */
export async function getConversation(sessionId) {
  if (!sessionId) throw new Error("getConversation: sessionId is required");
  return request(`/api/chat/conversation/${encodeURIComponent(sessionId)}`, {
    method: "GET",
  });
}

export async function getHealth() {
  return request("/api/health", { method: "GET" });
}

export async function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Default export for convenience.
export default {
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getUserContext,
  sendChatMessage,
  getConversation,
  getHealth,
  registerUser,
  loginUser,
};
