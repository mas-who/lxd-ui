import { ConfirmationModal, Notification } from "@canonical/react-components";
import { FC, useState } from "react";
import { LxdIdentity } from "types/permissions";
import {
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "util/permissionIdentities";
import { useSettings } from "context/useSettings";
import GroupsOrIdentityChangesTable from "./GroupOrIdentityChangesTable";

interface Props {
  onConfirm: () => void;
  close: () => void;
  selectedIdentities: LxdIdentity[];
  selectedGroups: string[];
  modifiedGroups: Set<string>;
}

const IdentityGroupsPanelConfirmModal: FC<Props> = ({
  onConfirm,
  close,
  selectedGroups,
  modifiedGroups,
  selectedIdentities,
}) => {
  const { data: settings } = useSettings();
  const [groupBy, setGroupBy] = useState<"user" | "group">("user");
  const hasLoggedInIdentity = selectedIdentities.some(
    (identity) => identity.name === settings?.auth_user_name,
  );

  const identityGroupsChangeSummary = getChangesInGroupsForIdentities({
    identities: selectedIdentities,
    newGroups: selectedGroups,
    modifiedGroups,
  });

  const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
    identityGroupsChangeSummary,
  );

  const handleChangeGroupBy = () => {
    setGroupBy((prev) => {
      if (prev === "user") {
        return "group";
      }

      return "user";
    });
  };

  return (
    <ConfirmationModal
      confirmButtonLabel="Confirm changes"
      confirmButtonAppearance="positive"
      onConfirm={onConfirm}
      close={close}
      title="Confirm group modification"
      className="identity-groups-confirm-modal"
    >
      <GroupsOrIdentityChangesTable
        identityGroupsChangeSummary={identityGroupsChangeSummary}
        groupIdentitiesChangeSummary={groupIdentitiesChangeSummary}
        authUserName={settings?.auth_user_name || ""}
        groupBy={groupBy}
        onChangeGroupBy={handleChangeGroupBy}
      />
      {hasLoggedInIdentity && (
        <Notification
          severity="caution"
          title="Self-modification"
          className="u-no-margin--bottom"
        >
          Note that this action will modify the permissions of the current
          logged-in user (YOU). You might not be able to reverse this change
          once you’ve made it.
        </Notification>
      )}
    </ConfirmationModal>
  );
};

export default IdentityGroupsPanelConfirmModal;
