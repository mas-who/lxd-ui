import { Button, Icon } from "@canonical/react-components";
import React, { FC } from "react";
import { getClientOS } from "util/helpers";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  modifiedGroupsCount: number;
  onUndoGroupChange: () => void;
}

const IdentityGroupsPanelActions: FC<Props> = ({
  modifiedGroupsCount,
  onUndoGroupChange,
}) => {
  const controlKey =
    getClientOS(navigator.userAgent) === "macos" ? "\u2318" : "ctrl";

  return (
    <div className="actions">
      <div className="modified-status">
        <Icon name="status-in-progress-small" />
        <span>{`${modifiedGroupsCount} ${pluralize("group", modifiedGroupsCount)} will be modified`}</span>
      </div>
      <Button
        hasIcon
        className="u-no-margin--bottom"
        dense
        onClick={onUndoGroupChange}
        title={`Undo most recent change (${controlKey}+z)`}
      >
        <Icon name="restart" />
        <span>{`Undo`}</span>
      </Button>
    </div>
  );
};

export default IdentityGroupsPanelActions;
