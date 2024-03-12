import {
  ActionButton,
  Button,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchIdentities,
  fetchLxdGroups,
  updateGroupsForIdentities,
} from "api/permissions";
import SidePanel from "components/SidePanel";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import PermissionLxdGroupsFilter, {
  PermissionLxdGroupsFilterType,
  QUERY,
} from "../PermissionLxdGroupsFilter";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { useSearchParams } from "react-router-dom";
import {
  generateGroupAllocationsForIdentities,
  getCurrentGroupAllocationsForIdentities,
} from "util/permissionIdentities";
import useSortTableData from "util/useSortTableData";
import { useToastNotification } from "context/toastNotificationProvider";
import useEditHistory from "util/useEditHistory";
import IdentityGroupsPanelActions from "./IdentityGroupsPanelActions";
import { pluralize } from "util/instanceBulkActions";
import IdentityGroupsPanelConfirmModal from "./IdentityGroupsPanelConfirmModal";

type PanelHistoryState = {
  modifiedGroups: Set<string>;
  groupsAssignedToEveryIdentity: string[];
  groupsAssignedToSomeIdentities: string[];
};

interface Props {
  selectedIdentityNames: string[];
}

const EditIdentityGroupsPanel: FC<Props> = ({ selectedIdentityNames }) => {
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const {
    data: groups = [],
    error: groupsError,
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: [queryKeys.lxdGroups],
    queryFn: fetchLxdGroups,
  });

  const {
    data: identities = [],
    error: identitiesError,
    isLoading: identitiesLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

  const {
    desiredState,
    save: saveToPanelHistory,
    undo: undoGroupChange,
  } = useEditHistory<PanelHistoryState>({
    initialState: {
      modifiedGroups: new Set(),
      groupsAssignedToEveryIdentity: [],
      groupsAssignedToSomeIdentities: [],
    },
  });

  const handleModifyGroups = (newGroupsAssignedToEveryIdentity: string[]) => {
    // If all groups are deselected then all groups are modified
    if (!newGroupsAssignedToEveryIdentity.length) {
      saveToPanelHistory({
        modifiedGroups: new Set(groups.map((group) => group.name)),
        groupsAssignedToEveryIdentity: newGroupsAssignedToEveryIdentity,
        groupsAssignedToSomeIdentities: [],
      });
      return;
    }

    const oldGroupsAssignedToEveryIdentityLookup = new Set(
      desiredState.groupsAssignedToEveryIdentity,
    );
    const newGroupsAssignedToEveryIdentityLookup = new Set(
      newGroupsAssignedToEveryIdentity,
    );
    const newModifiedGroups = new Set(desiredState.modifiedGroups);

    // new groups selected becomes modified
    newGroupsAssignedToEveryIdentity.forEach((name) => {
      if (!oldGroupsAssignedToEveryIdentityLookup.has(name)) {
        newModifiedGroups.add(name);
      }
    });

    // groups unselected becomes modified
    // check if any groups that's in the old state but not in the new selected groups
    desiredState.groupsAssignedToEveryIdentity.forEach((name) => {
      if (!newGroupsAssignedToEveryIdentityLookup.has(name)) {
        newModifiedGroups.add(name);
      }
    });

    // any group that's modified cannot be assigned to only some identities
    const newGroupsAssignedToSomeIdentities =
      desiredState.groupsAssignedToSomeIdentities.filter(
        (candidate) => !newModifiedGroups.has(candidate),
      ) || [];

    saveToPanelHistory({
      modifiedGroups: newModifiedGroups,
      groupsAssignedToEveryIdentity: newGroupsAssignedToEveryIdentity,
      groupsAssignedToSomeIdentities: newGroupsAssignedToSomeIdentities,
    });
  };

  const error = groupsError || identitiesError;
  const isLoading = groupsLoading || identitiesLoading;

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  const selectedIdentityNamesLookup = new Set(selectedIdentityNames);
  const selectedIdentities = identities.filter((identity) =>
    selectedIdentityNamesLookup.has(identity.name),
  );

  // Figure out if groups are allocated to all or some of the selected identities when the panel initially mounts
  // This useEffect is needed so that users can undo to the original state of groups selections
  useEffect(() => {
    if (!isLoading && !error && selectedIdentities.length) {
      const { groupsAssignedToEveryIdentity, groupsAssignedToSomeIdentities } =
        getCurrentGroupAllocationsForIdentities(groups, selectedIdentities);

      saveToPanelHistory({
        modifiedGroups: desiredState.modifiedGroups,
        groupsAssignedToEveryIdentity,
        groupsAssignedToSomeIdentities,
      });
    }
  }, [isLoading, error]);

  // while the panel is open, if user cleared all identities selected then close the panel
  useEffect(() => {
    if (!selectedIdentityNames.length) {
      panelParams.clear();
      return;
    }
  }, [selectedIdentityNames.length]);

  const handleSaveGroupsForIdentities = () => {
    setSubmitting(true);

    const newGroupsForIdentities = generateGroupAllocationsForIdentities({
      groupsForAllIdentities: desiredState.groupsAssignedToEveryIdentity,
      groupsForSomeIdentities: desiredState.groupsAssignedToSomeIdentities,
      identities,
    });

    updateGroupsForIdentities(selectedIdentities, newGroupsForIdentities)
      .then(() => {
        // modifying groups should invalidate both identities and groups api queries
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.lxdGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        const successMessage =
          selectedIdentities.length > 1
            ? `Updated groups for ${selectedIdentities.length} identtiies`
            : `Updated groups for ${selectedIdentities[0].name}`;
        toastNotify.success(successMessage);
        panelParams.clear();
      })
      .catch((e) => {
        notify.failure("Update groups failed", e);
      })
      .finally(() => {
        setSubmitting(false);
        setConfirming(false);
      });
  };

  const headers = [
    { content: "Group name", sortKey: "name", role: "rowheader" },
    {
      content: "Description",
      sortKey: "description",
      role: "rowheader",
    },
    {
      content: "",
      role: "rowheader",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filters: PermissionLxdGroupsFilterType = {
    queries: searchParams.getAll(QUERY),
  };

  const filteredGroups = groups.filter((group) => {
    return filters.queries.every((q) => group.name.toLowerCase().includes(q));
  });

  const rows = filteredGroups.map((group) => {
    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: group.description || "N/A",
          role: "cell",
          "aria-label": "Description",
          title: `desc: ${group.description}`,
        },
        {
          content: desiredState.modifiedGroups.has(group.name) && (
            <Icon name="status-in-progress-small" />
          ),
          role: "cell",
          "aria-label": "Modified status",
          className: "modified-status u-align--right",
        },
      ],
      sortData: {
        name: group.name,
        description: group.description,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  // unmodified groups should always reflect if they are assigned to every identity selected
  const { groupsAssignedToSomeIdentities } =
    getCurrentGroupAllocationsForIdentities(groups, selectedIdentities);

  const unModifiedGroupsAssignedToSomeIdentities =
    groupsAssignedToSomeIdentities.filter(
      (group) => !desiredState.modifiedGroups.has(group),
    );

  const content = (
    <ScrollableTable
      dependencies={[groups, desiredState.modifiedGroups.size]}
      tableId="permission-identity-groups-table"
      belowIds={["panel-footer"]}
    >
      <SelectableMainTable
        id="permission-identity-groups-table"
        headers={headers}
        rows={sortedRows}
        sortable
        emptyStateMsg="No lxd groups found"
        onUpdateSort={updateSort}
        itemName="group"
        parentName="server"
        selectedNames={desiredState.groupsAssignedToEveryIdentity}
        setSelectedNames={handleModifyGroups}
        processingNames={[]}
        filteredNames={groups.map((group) => group.name)}
        indeterminateNames={new Set(unModifiedGroupsAssignedToSomeIdentities)}
      />
    </ScrollableTable>
  );

  const panelTitle =
    selectedIdentities.length > 1
      ? `Change groups for ${selectedIdentities.length} users`
      : `Change groups for ${selectedIdentities[0]?.name}`;

  const confirmButtonText = desiredState.modifiedGroups.size
    ? `Apply ${desiredState.modifiedGroups.size} group ${pluralize("change", desiredState.modifiedGroups.size)}`
    : "Modify groups";

  return (
    <>
      <SidePanel
        isOverlay
        loading={isLoading}
        hasError={!groups || !identities}
        className="identity-groups-panel"
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{panelTitle}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <PermissionLxdGroupsFilter />
        <SidePanel.Content className="u-no-padding">
          {content}
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          {desiredState.modifiedGroups.size ? (
            <IdentityGroupsPanelActions
              modifiedGroupsCount={desiredState.modifiedGroups.size}
              onUndoGroupChange={undoGroupChange}
            />
          ) : null}
          <Button
            appearance="base"
            onClick={panelParams.clear}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            loading={submitting}
            onClick={() => setConfirming(true)}
            className="u-no-margin--bottom"
            disabled={!desiredState.modifiedGroups.size}
          >
            {confirmButtonText}
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
      {confirming && (
        <IdentityGroupsPanelConfirmModal
          close={() => setConfirming(false)}
          onConfirm={handleSaveGroupsForIdentities}
          selectedIdentities={selectedIdentities}
          modifiedGroups={desiredState.modifiedGroups}
          selectedGroups={desiredState.groupsAssignedToEveryIdentity}
        />
      )}
    </>
  );
};

export default EditIdentityGroupsPanel;
