import { FC, useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import ItemName from "components/ItemName";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdGroup, LxdIdentity } from "types/permissions";
import { updateGroupsForIdentity } from "api/permissions";

interface Props {
  idendity: LxdIdentity;
  group: LxdGroup;
}

const PermissionIdentityDeleteGroupBtn: FC<Props> = ({ idendity, group }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = () => {
    const newIdentityGroups = idendity.groups?.filter(
      (existingGroup) => existingGroup !== group.name,
    );
    setLoading(true);
    updateGroupsForIdentity(idendity, newIdentityGroups || [])
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              query.queryKey[0] === queryKeys.identities ||
              query.queryKey[0] === queryKeys.lxdGroups
            );
          },
        });
        toastNotify.success(`${group.name} removed for ${idendity.name}.`);
      })
      .catch((e) => {
        notify.failure("Group deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm remove",
        children: (
          <p>
            This will permanently remove <ItemName item={group} bold /> for{" "}
            <ItemName item={idendity} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Remove group",
        onConfirm: handleDelete,
        message: "Remove group",
      }}
      appearance="base"
      className="u-no-margin--bottom is-dense"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default PermissionIdentityDeleteGroupBtn;
