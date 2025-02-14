import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdProject } from "types/project";

export const useProjectEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canCreateInstances = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_instances",
      project?.access_entitlements,
    );

  const canCreateImages = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_images",
      project?.access_entitlements,
    );

  const canCreateImageAliases = (project?: LxdProject) =>
    hasEntitlement(
      isFineGrained,
      "can_create_image_aliases",
      project?.access_entitlements,
    );

  return {
    canCreateInstances,
    canCreateImages,
    canCreateImageAliases,
  };
};
