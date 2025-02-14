import { useAuth } from "context/auth";
import { hasEntitlement } from "./helpers";
import { LxdStoragePool } from "types/storage";

export const useInstanceEntitlements = () => {
  const { isFineGrained } = useAuth();

  const canDeletePool = (pool: LxdStoragePool) =>
    hasEntitlement(isFineGrained, "can_delete", pool?.access_entitlements);

  return {
    canDeletePool,
  };
};
