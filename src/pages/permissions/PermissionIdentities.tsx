import {
  Chip,
  Row,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchIdentities } from "api/permissions";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import SelectedTableNotification from "components/SelectedTableNotification";
import { FC, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";
import PermissionIdentitiesFilter, {
  AUTH_METHOD,
  PermissionIdentitiesFilterType,
  QUERY,
} from "./PermissionIdentitiesFilter";
import { useSettings } from "context/useSettings";
import PermissionIdentityEditGroupsBtn from "./PermissionIdentityEditGroupBtn";
import { encodeIdentityNameForUrl } from "util/permissionIdentities";
import usePanelParams, { panels } from "util/usePanelParams";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import EditIdentityGroupsPanel from "./panels/EditIdentityGroupsPanel";

const PermissionIdentities: FC = () => {
  const notify = useNotify();
  const {
    data: identities = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: () => fetchIdentities(),
  });
  const { data: settings } = useSettings();
  const docBaseLink = useDocs();
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const [selectedIdentityNames, setSelectedIdentityNames] = useState<string[]>(
    [],
  );

  if (error) {
    notify.failure("Loading identities failed", error);
  }

  const headers = [
    { content: "Name", className: "name", sortKey: "name" },
    { content: "ID", sortKey: "id" },
    { content: "Auth method", sortKey: "authentication_method" },
    { content: "Type", sortKey: "type" },
    {
      content: "Groups",
      sortKey: "groups",
      className: "u-align--right",
    },
  ];

  const filters: PermissionIdentitiesFilterType = {
    queries: searchParams.getAll(QUERY),
    authMethod: searchParams.getAll(AUTH_METHOD),
  };

  const filteredIdentities = identities.filter((identity) => {
    if (
      !filters.queries.every(
        (q) =>
          identity.name.toLowerCase().includes(q) ||
          identity.id.toLowerCase().includes(q),
      )
    ) {
      return false;
    }

    if (
      filters.authMethod.length > 0 &&
      !filters.authMethod.includes(identity.authentication_method)
    ) {
      return false;
    }

    return true;
  });

  const rows = filteredIdentities.map((identity) => {
    const isLoggedInIdentity = settings?.auth_user_name === identity.id;
    return {
      name: identity.name,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              className="u-truncate name-link"
              title={`name: ${identity.name}`}
              to={`/ui/permissions/identity/${identity.authentication_method}/${encodeIdentityNameForUrl(identity.name)}`}
            >
              {identity.name}
              {isLoggedInIdentity && (
                <Chip value="You" className="u-no-margin--bottom" />
              )}
            </Link>
          ),
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: identity.id,
          role: "cell",
          "aria-label": "ID",
          className: "u-truncate",
          title: `id: ${identity.id}`,
        },
        {
          content: identity.authentication_method.toUpperCase(),
          role: "cell",
          "aria-label": "Auth method",
        },
        {
          content: identity.type,
          role: "cell",
          "aria-label": "Type",
          className: "u-truncate",
          title: `type: ${identity.type}`,
        },
        {
          content: identity.groups?.length || 0,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Groups for this identity",
        },
      ],
      sortData: {
        id: identity.id,
        name: identity.name,
        authentication_method: identity.authentication_method,
        type: identity.type,
        groups: identity.groups?.length || 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  const selectedIdentities = identities.filter((identity) =>
    selectedIdentityNames.includes(identity.name),
  );

  // NOTE: tls user group membership cannot be modified, this will be supported in the future
  const unSelectableIdentityNames = new Set<string>();
  const nonTlsUsers = identities.filter((identity) => {
    const isTlsIdentity = identity.authentication_method === "tls";
    if (isTlsIdentity) {
      unSelectableIdentityNames.add(identity.name);
    }
    return !isTlsIdentity;
  });

  if (isLoading) {
    return <Loader text="Loading identities" />;
  }

  return (
    <>
      <CustomLayout
        contentClassName="u-no-padding--bottom"
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  href={`${docBaseLink}/reference/manpages/lxc/auth`}
                  title="Learn more about permissions"
                >
                  Identities
                </HelpLink>
              </PageHeader.Title>
              {!selectedIdentityNames.length && !panelParams.panel && (
                <PageHeader.Search>
                  <PermissionIdentitiesFilter />
                </PageHeader.Search>
              )}
              {!!selectedIdentityNames.length && (
                <PermissionIdentityEditGroupsBtn
                  identities={selectedIdentities}
                  className="u-no-margin--bottom"
                />
              )}
            </PageHeader.Left>
          </PageHeader>
        }
      >
        <NotificationRow />
        <Row className="permission-identities">
          <ScrollableTable
            dependencies={[identities]}
            tableId="identities-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="user"
              className="u-no-margin--top"
              aria-label="Table pagination control"
              description={
                selectedIdentityNames.length > 0 && (
                  <SelectedTableNotification
                    totalCount={nonTlsUsers.length ?? 0}
                    itemName="user"
                    parentName="server"
                    selectedNames={selectedIdentityNames}
                    setSelectedNames={setSelectedIdentityNames}
                    filteredNames={nonTlsUsers.map((item) => item.name)}
                  />
                )
              }
            >
              <SelectableMainTable
                id="identities-table"
                headers={headers}
                rows={sortedRows}
                sortable
                emptyStateMsg="No identities found matching this search"
                onUpdateSort={updateSort}
                itemName="user"
                parentName="server"
                selectedNames={selectedIdentityNames}
                setSelectedNames={setSelectedIdentityNames}
                processingNames={[]}
                filteredNames={nonTlsUsers.map((identity) => identity.name)}
                unSelectableNames={unSelectableIdentityNames}
              />
            </TablePagination>
          </ScrollableTable>
        </Row>
      </CustomLayout>
      {panelParams.panel === panels.identityGroups && (
        <EditIdentityGroupsPanel
          selectedIdentityNames={selectedIdentityNames}
        />
      )}
    </>
  );
};

export default PermissionIdentities;
