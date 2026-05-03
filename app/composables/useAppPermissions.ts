// composables/useAppPermissions.ts
import { ref } from "vue";
import { useEventBus } from "@vueuse/core";
export type PopupState =
  | "mic-error"
  | "cam-error"
  | "mic-permission"
  | "cam-permission";

interface PermissionRequest {
  state: PopupState;
  resolve: (value: boolean) => void;
}
const permissionBus = useEventBus<PermissionRequest>("global-permission-popup");
export function useAppPermissions() {
  const checkMediaStatus = async () => {
    try {
      const mic = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      const cam = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return { mic: mic.state, cam: cam.state };
    } catch (err) {
      return { mic: "unknown", cam: "unknown" };
    }
  };

  // Requests BOTH at once as requested, with a fallback if hardware is missing
  const requestMediaAccess = async (fallbackType: "audio" | "video") => {
    try {
      // Try getting both first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      return { success: true };
    } catch (error: any) {
      console.log(error);
      // If it failed because of missing hardware (e.g. Mac mini has no cam), fallback to the specific one needed
      if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        try {
          const singleStream = await navigator.mediaDevices.getUserMedia({
            audio: fallbackType === "audio",
            video: fallbackType === "video",
          });
          singleStream.getTracks().forEach((track) => track.stop());
          return { success: true };
        } catch (fallbackError: any) {
          return { success: false, error: fallbackError.name };
        }
      }
      return { success: false, error: error.name };
    }
  };

  const requestLocation = async (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Unsupported");
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const requestScreenShare = async () => {
    try {
      return await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (error) {
      return null;
    }
  };

  const requestWithPopup = (state: PopupState) => {
    return new Promise<boolean>((resolve) => {
      permissionBus.emit({ state, resolve });
    });
  };

  return {
    checkMediaStatus,
    requestMediaAccess,
    requestLocation,
    requestScreenShare,
    requestWithPopup,
  };
}
