import { ref } from "vue";

export type PermissionType = "microphone" | "camera" | "screen";

export function useAppPermissions() {
  const permissionStatus = ref<Record<PermissionType, boolean>>({
    microphone: false,
    camera: false,
    screen: false,
  });

  async function requestPermission(type: PermissionType): Promise<boolean> {
    try {
      if (type === "screen") {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        permissionStatus.value.screen = true;
        return true;
      }

      const constraints: MediaStreamConstraints = {
        audio: type === "microphone",
        video: type === "camera",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((t) => t.stop());
      permissionStatus.value[type] = true;
      return true;
    } catch {
      permissionStatus.value[type] = false;
      return false;
    }
  }

  async function checkPermission(type: PermissionType): Promise<boolean> {
    try {
      if (type === "screen") return permissionStatus.value.screen;
      const name = type === "microphone" ? "microphone" : "camera";
      const result = await navigator.permissions.query({
        name: name as PermissionName,
      });
      const granted = result.state === "granted";
      permissionStatus.value[type] = granted;
      return granted;
    } catch {
      return false;
    }
  }

  return {
    permissionStatus,
    requestPermission,
    checkPermission,
  };
}
