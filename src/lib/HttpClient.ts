import axios, { AxiosHeaders, AxiosRequestHeaders, AxiosInstance } from "axios";

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    return token ? `Bearer ${token}` : null;
  } catch {
    return null;
  }
};

const withAuth = (headers: AxiosHeaders = new AxiosHeaders()): AxiosHeaders => {
  const token = getToken();
  if (token) headers.set("Authorization", token);
  return headers;
};

interface RequestConfig {
  headers?: AxiosRequestHeaders;
  params?: object;
  data?: object;
  apiName?: string;
}

export class HttpClient {
  private axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({ baseURL });
  }

  private async wrap<T>(promise: Promise<any>): Promise<T | null> {
    try {
      const res = await promise;
      return res?.data ?? null;
    } catch (err: any) {
      console.log("HTTP Error:", err);
      return null;
    }
  }

  get = <T = any>(url: string, cfg: RequestConfig = {}) =>
    this.wrap<T>(
      this.axios.get(url, {
        headers: withAuth(new AxiosHeaders(cfg.headers)),
        ...cfg,
      })
    );

  post = <T = any>(url: string, data: any = null, cfg: RequestConfig = {}) =>
    this.wrap<T>(
      this.axios.post(url, data, {
        headers: withAuth(new AxiosHeaders(cfg.headers)),
        ...cfg,
      })
    );

  put = <T = any>(url: string, data: any, cfg: RequestConfig = {}) =>
    this.wrap<T>(
      this.axios.put(url, data, {
        headers: withAuth(new AxiosHeaders(cfg.headers)),
        ...cfg,
      })
    );

  patch = <T = any>(url: string, data: any, cfg: RequestConfig = {}) =>
    this.wrap<T>(
      this.axios.patch(url, data, {
        headers: withAuth(new AxiosHeaders(cfg.headers)),
        ...cfg,
      })
    );

  delete = <T = any>(url: string, cfg: RequestConfig = {}) =>
    this.wrap<T>(
      this.axios.delete(url, {
        headers: withAuth(new AxiosHeaders(cfg.headers)),
        ...cfg,
      })
    );
}
