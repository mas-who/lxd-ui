import { Icon } from "@canonical/react-components";
import { FC } from "react";
import { IdentitiesOrGroupsChangeSummary } from "util/permissionIdentities";

interface Props {
  groupBy: "user" | "group";
  onChangeGroupBy: () => void;
  authUserName: string;
  identityGroupsChangeSummary: IdentitiesOrGroupsChangeSummary;
  groupIdentitiesChangeSummary: IdentitiesOrGroupsChangeSummary;
}

const generateRowsFromIdentityGroupChanges = (args: {
  identityGroupsChangeSummary: IdentitiesOrGroupsChangeSummary;
  authUserName: string;
}) => {
  const { identityGroupsChangeSummary, authUserName } = args;
  const identityIDs = Object.keys(identityGroupsChangeSummary);

  const rows: JSX.Element[] = [];
  for (const id of identityIDs) {
    const groupChangesForIdentity = identityGroupsChangeSummary[id];
    const identityLoggedIn = id === authUserName;
    let isFirstRow = true;
    for (const group of groupChangesForIdentity.added) {
      const row = (
        <tr className={isFirstRow ? "first-row" : ""}>
          <td>
            {isFirstRow
              ? `${groupChangesForIdentity.name} ${identityLoggedIn ? "(YOU)" : ""}`
              : ""}
          </td>
          <td>+ {group}</td>
        </tr>
      );
      rows.push(row);
      isFirstRow = false;
    }

    for (const group of groupChangesForIdentity.removed) {
      const row = (
        <tr className={isFirstRow ? "first-row" : ""}>
          <td>{isFirstRow ? groupChangesForIdentity.name : ""}</td>
          <td className="remove-group">- {group}</td>
        </tr>
      );
      rows.push(row);
      isFirstRow = false;
    }
  }

  return rows;
};

const generateRowsFromGroupIdentityChanges = (args: {
  groupIdentitiesChangeSummary: IdentitiesOrGroupsChangeSummary;
}) => {
  const { groupIdentitiesChangeSummary } = args;
  const groups = Object.keys(groupIdentitiesChangeSummary);

  const rows: JSX.Element[] = [];
  for (const group of groups) {
    const identityChangesForGroup = groupIdentitiesChangeSummary[group];
    let isFirstRow = true;
    for (const identity of identityChangesForGroup.added) {
      const row = (
        <tr className={isFirstRow ? "first-row" : ""}>
          <td>{isFirstRow ? identityChangesForGroup.name : ""}</td>
          <td>+ {identity}</td>
        </tr>
      );
      rows.push(row);
      isFirstRow = false;
    }

    for (const identity of identityChangesForGroup.removed) {
      const row = (
        <tr className={isFirstRow ? "first-row" : ""}>
          <td>{isFirstRow ? identityChangesForGroup.name : ""}</td>
          <td className="remove-identity">- {identity}</td>
        </tr>
      );
      rows.push(row);
      isFirstRow = false;
    }
  }

  return rows;
};

const GroupsOrIdentityChangesTable: FC<Props> = ({
  groupBy,
  onChangeGroupBy,
  authUserName,
  groupIdentitiesChangeSummary,
  identityGroupsChangeSummary,
}) => {
  let rows: JSX.Element[] = [];
  if (groupBy === "user") {
    rows = generateRowsFromIdentityGroupChanges({
      identityGroupsChangeSummary,
      authUserName,
    });
  }

  if (groupBy === "group") {
    rows = generateRowsFromGroupIdentityChanges({
      groupIdentitiesChangeSummary,
    });
  }

  return (
    <div className="confirm-table">
      <table>
        <thead>
          <tr>
            <th className="display-by-header">
              {groupBy === "user" ? "User" : "Group"}
              <Icon
                name="change-version"
                onClick={onChangeGroupBy}
                className="display-by-icon"
              />
            </th>
            <th>{groupBy === "user" ? "Group" : "User"}</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export default GroupsOrIdentityChangesTable;
