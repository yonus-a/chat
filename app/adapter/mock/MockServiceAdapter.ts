import type {
  ServiceAdapter,
  FetchProvidersParams,
  ProvidersPage,
} from "../ports/ServiceAdapter";
import type { Service } from "~/types/service";
import { seedServices, seedProviders, delay } from "~/mock";

export interface MockServiceAdapterOptions {
  latencyMs?: number;
}

export const createMockServiceAdapter = (
  opts: MockServiceAdapterOptions = {},
): ServiceAdapter => {
  const { latencyMs = 800 } = opts;

  return {
    async fetchServices(): Promise<Service[]> {
      await delay(latencyMs);
      return seedServices();
    },

    async fetchProviders(
      params: FetchProvidersParams,
    ): Promise<ProvidersPage> {
      await delay(latencyMs * 1.5);
      return seedProviders(params);
    },
  };
};
