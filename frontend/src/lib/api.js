export class ApiRequestError extends Error {
  constructor(message, { status, code, requestId, url, cause } = {}) {
    super(message, { cause });
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.url = url;
  }
}

export function createApiClient({ apiUrl, getAccessToken, timeoutMs = 15_000 }) {
  async function request(path, { authenticated = true, method = "GET", body } = {}) {
    const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = { "Content-Type": "application/json" };
    if (authenticated) {
      const token = await getAccessToken();
      if (!token) throw new ApiRequestError("ไม่พบ Session กรุณาเข้าสู่ระบบใหม่", { code: "SESSION_MISSING", url });
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();

      if (!response.ok) {
        const apiError = payload?.error;
        throw new ApiRequestError(
          apiError?.message || `Backend ตอบกลับด้วย HTTP ${response.status}`,
          {
            status: response.status,
            code: apiError?.code,
            requestId: apiError?.requestId || response.headers.get("x-request-id"),
            url
          }
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof ApiRequestError) throw error;
      if (error.name === "AbortError") {
        throw new ApiRequestError(`Backend ไม่ตอบกลับภายใน ${timeoutMs / 1000} วินาที`, { code: "API_TIMEOUT", url, cause: error });
      }
      throw new ApiRequestError(
        `เชื่อมต่อ Backend ไม่สำเร็จ (${url}) กรุณาตรวจสอบ VITE_API_BASE_URL, Backend Status และ CORS_ORIGIN`,
        { code: "NETWORK_ERROR", url, cause: error }
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return { request };
}
