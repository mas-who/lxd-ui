import {
  EmptyState,
  Icon,
  MainTable,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchLxdGroups } from "api/permissions";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import { useDocs } from "context/useDocs";
import { FC } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import PermissionLxdGroupsFilter, {
  PermissionLxdGroupsFilterType,
  QUERY,
} from "./PermissionLxdGroupsFilter";
import { LxdIdentity } from "types/permissions";
import PermissionIdentityDeleteGroupBtn from "./PermissionIdentityDeleteGroupBtn";
import PermissionIdentityEditGroupsBtn from "./PermissionIdentityEditGroupBtn";
import usePanelParams, { panels } from "util/usePanelParams";
import EditIdentityGroupsPanel from "./panels/EditIdentityGroupsPanel";

interface Props {
  identity: LxdIdentity;
}

const PermissionIdentityGroups: FC<Props> = ({ identity }) => {
  const notify = useNotify();
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.lxdGroups],
    queryFn: fetchLxdGroups,
  });

  if (error) {
    notify.failure("Loading lxd groups failed", error);
  }

  const headers = [
    { content: "Group name", sortKey: "name" },
    { content: "Description", className: "description" },
    { "aria-label": "Actions", className: "u-align--right actions" },
  ];

  const filters: PermissionLxdGroupsFilterType = {
    queries: searchParams.getAll(QUERY),
  };

  const isPanelOpen = searchParams.has("panel");
  const identityGroupsLookup = new Set(identity.groups);
  const groupsForIdentity = groups.filter((group) => {
    // only display groups associated to the current identity
    if (identityGroupsLookup.has(group.name)) {
      return (
        filters.queries.every(
          (q) =>
            group.name.toLowerCase().includes(q) ||
            group.description.toLowerCase().includes(q),
        ) || isPanelOpen
      );
    }

    return false;
  });

  const rows = groupsForIdentity.map((group) => {
    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              className="u-truncate"
              title={`name: ${group.name}`}
              to={`/ui/permissions/lxd-group/${group.name}`}
            >
              {group.name}
            </Link>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: (
            <span className="u-truncate" title={`desc: ${group.description}`}>
              {group.description}
            </span>
          ),
          role: "cell",
          "aria-label": "Description",
        },
        {
          className: "actions u-align--right",
          content: (
            <PermissionIdentityDeleteGroupBtn
              key={group.name}
              idendity={identity}
              group={group}
            />
          ),
          role: "cell",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: group.name,
        description: group.description,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Loader text="Loading groups" />;
  }

  const identityGroupsPanel = panelParams.panel === panels.identityGroups && (
    <EditIdentityGroupsPanel selectedIdentityNames={[identity.name]} />
  );

  return groups.length > 0 ? (
    <>
      <div className="permission-identity-groups">
        <div className="upper-controls-bar">
          {!isPanelOpen && (
            <div className="search-box-wrapper">
              <PermissionLxdGroupsFilter />
            </div>
          )}
          <PermissionIdentityEditGroupsBtn identities={[identity]} />
        </div>
        <ScrollableTable
          dependencies={[groups]}
          tableId="permission-groups-table"
          belowIds={["status-bar"]}
        >
          <TablePagination
            data={sortedRows}
            id="pagination"
            itemName="group"
            className="u-no-margin--top"
            aria-label="Table pagination control"
          >
            <MainTable
              id="permission-groups-table"
              headers={headers}
              sortable
              emptyStateMsg="No groups found matching this search"
              onUpdateSort={updateSort}
            />
          </TablePagination>
        </ScrollableTable>
      </div>
      {identityGroupsPanel}
    </>
  ) : (
    <>
      <EmptyState
        className="empty-state"
        image={<Icon name="lock-locked" className="empty-state-icon" />}
        title={`No groups found in for ${identity.name}`}
      >
        <p>LXD groups will appear here.</p>
        <p>
          <a
            href={`${docBaseLink}/reference/manpages/lxc/auth`}
            target="_blank"
            rel="noreferrer"
          >
            Learn more about permissions
            <Icon className="external-link-icon" name="external-link" />
          </a>
        </p>
        <PermissionIdentityEditGroupsBtn identities={[identity]} />
      </EmptyState>
      {identityGroupsPanel}
    </>
  );
};

export default PermissionIdentityGroups;
