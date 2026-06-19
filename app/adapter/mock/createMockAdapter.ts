import type { HostAdapter } from "../HostAdapter";
import {
  createMockChatAdapter,
  type MockChatAdapterOptions,
} from "./MockChatAdapter";
import {
  createMockChatActionAdapter,
  type MockChatActionAdapterOptions,
} from "./MockChatActionAdapter";
import {
  createMockServiceAdapter,
  type MockServiceAdapterOptions,
} from "./MockServiceAdapter";
import {
  createMockMedicationAdapter,
  type MockMedicationAdapterOptions,
} from "./MockMedicationAdapter";
import { MockCallAdapter } from "./MockCallAdapter";

export interface MockAdapterOptions {
  chat?: MockChatAdapterOptions;
  chatAction?: MockChatActionAdapterOptions;
  service?: MockServiceAdapterOptions;
  medication?: MockMedicationAdapterOptions;
}

export const createMockAdapter = (
  opts: MockAdapterOptions = {},
): HostAdapter => ({
  chat: createMockChatAdapter(opts.chat),
  chatAction: createMockChatActionAdapter(opts.chatAction),
  service: createMockServiceAdapter(opts.service),
  medication: createMockMedicationAdapter(opts.medication),
  call: new MockCallAdapter(),
});
