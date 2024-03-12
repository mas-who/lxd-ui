import { AnyObject, TestFunction } from "yup";
import { AbortControllerState, checkDuplicateName } from "./helpers";

export const testDuplicatePermissionGroupName = (
  controllerState: AbortControllerState,
  groupType: "lxd-groups" | "idp-groups" = "lxd-groups",
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  const endpoint =
    groupType === "lxd-groups" ? "groups" : "identity-provider-groups";
  return [
    "deduplicate",
    "A permission group with this name already exists",
    (value?: string) => {
      return checkDuplicateName(value, "", controllerState, `auth/${endpoint}`);
    },
  ];
};
