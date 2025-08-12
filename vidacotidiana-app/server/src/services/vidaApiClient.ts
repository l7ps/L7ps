import axios, { AxiosInstance } from "axios";
import { loadEnv } from "../env";

export interface VidaPartnerRaw {
  [key: string]: any;
}

export interface FetchPartnersPageOptions {
  page: number;
  size: number;
}

export class VidaApiClient {
  private client: AxiosInstance;
  private env = loadEnv();

  constructor() {
    const baseURL = this.env.VIDA_BASE_URL.replace(/\/$/, "");
    const headers: Record<string, string> = { Accept: "application/json" };

    if (this.env.VIDA_AUTH_TYPE === "basic") {
      const username = this.env.VIDA_USERNAME ?? "";
      const password = this.env.VIDA_PASSWORD ?? "";
      const token = Buffer.from(`${username}:${password}`).toString("base64");
      headers["Authorization"] = `Basic ${token}`;
    } else if (this.env.VIDA_AUTH_TYPE === "bearer") {
      const token = this.env.VIDA_BEARER_TOKEN ?? "";
      headers["Authorization"] = `Bearer ${token}`;
    }

    this.client = axios.create({ baseURL, headers, timeout: 60000 });
  }

  async fetchPartnersPage(options: FetchPartnersPageOptions): Promise<VidaPartnerRaw[]> {
    const { VIDA_PARTNERS_ENDPOINT, VIDA_PAGE_PARAM, VIDA_SIZE_PARAM } = this.env;
    const endpoint = VIDA_PARTNERS_ENDPOINT.startsWith("/")
      ? VIDA_PARTNERS_ENDPOINT
      : `/${VIDA_PARTNERS_ENDPOINT}`;

    const params: Record<string, any> = {
      [VIDA_PAGE_PARAM]: options.page,
      [VIDA_SIZE_PARAM]: options.size,
    };

    const { data } = await this.client.get(endpoint, { params });

    if (Array.isArray(data)) return data as VidaPartnerRaw[];
    if (Array.isArray((data as any)?.items)) return (data as any).items as VidaPartnerRaw[];
    if (Array.isArray((data as any)?.results)) return (data as any).results as VidaPartnerRaw[];

    // fallback: if single object return as array
    return [data as VidaPartnerRaw];
  }

  async fetchAllPartners(maxPages = 100): Promise<VidaPartnerRaw[]> {
    const start = Number(this.env.VIDA_PAGE_START ?? 1) || 1;
    const size = Number(this.env.VIDA_PAGE_SIZE ?? 100) || 100;

    const all: VidaPartnerRaw[] = [];
    for (let page = start; page < start + maxPages; page++) {
      const items = await this.fetchPartnersPage({ page, size });
      if (!items || items.length === 0) break;
      all.push(...items);
      if (items.length < size) break; // likely last page
    }
    return all;
  }
}