import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";

export const useServerEntitlements = () => {
  const { isFineGrained, serverEntitlements } = useAuth();

  const canEditServerConfiguration = () =>
    hasEntitlement(isFineGrained, "can_edit", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  const canViewMetrics = () =>
    hasEntitlement(isFineGrained, "can_view_metrics", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements) ||
    hasEntitlement(isFineGrained, "viewer", serverEntitlements);

  const canCreateIdentities = () =>
    hasEntitlement(
      isFineGrained,
      "can_create_identities",
      serverEntitlements,
    ) ||
    hasEntitlement(isFineGrained, "permission_manager", serverEntitlements) ||
    hasEntitlement(isFineGrained, "admin", serverEntitlements);

  return {
    canCreateIdentities,
    canEditServerConfiguration,
    canViewMetrics,
  };
};
