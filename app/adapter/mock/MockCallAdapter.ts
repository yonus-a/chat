import type { CallAdapter, CallSignalEvent } from "../ports/CallAdapter";

export class MockCallAdapter implements CallAdapter {
  public readonly isMockCall = true;
  private handler: ((e: CallSignalEvent) => void) | null = null;

  async initiate(_conversationId: string, _kind: "voice-call" | "video-call") {
    return { callId: `mock-${crypto.randomUUID()}` };
  }
  async sendOffer()  { /* no-op */ }
  async sendAnswer() { /* no-op */ }
  async sendIce()    { /* no-op */ }
  async end()        { /* no-op */ }
  onSignal(h: (e: CallSignalEvent) => void) {
    this.handler = h;
    return () => { this.handler = null; };
  }
}
