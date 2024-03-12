import { LxdGroup, LxdIdentity } from "types/permissions";

export type IdentitiesOrGroupsChangeSummary = Record<
  string,
  { added: Set<string>; removed: Set<string>; name: string }
>;

export const getIdentitiesForGroup = (group: LxdGroup) => {
  const oidcIdentities = group.identities?.oidc || [];
  const tlsIdentities = group.identities?.tls || [];
  const allIdentities = oidcIdentities.concat(tlsIdentities);
  const totalIdentities = allIdentities.length;

  return {
    oidcIdentities,
    tlsIdentities,
    allIdentities,
    totalIdentities,
  };
};

export const encodeIdentityNameForUrl = (name: string) => {
  // having "." in the url results in 404 errors when refreshing the page
  return encodeURIComponent(name.replaceAll(".", "#"));
};

export const decodeIdentityNameFromUrl = (name: string) => {
  return decodeURIComponent(name).replaceAll("#", ".");
};

// Given a set of lxd groups and some identities
// Generate a subset of those groups that's allocated to all identities
// Generate a subset of those groups that's allocated to some identities
export const getCurrentGroupAllocationsForIdentities = (
  groups: LxdGroup[],
  identities: LxdIdentity[],
) => {
  const totalIdentitiesCount = identities.length;
  const groupsAssignedToEveryIdentity: string[] = [];
  const groupsAssignedToSomeIdentities: string[] = [];
  for (const group of groups) {
    let allocatedCount = 0;
    const groupIdentitiesLookup = new Set(
      getIdentitiesForGroup(group).allIdentities,
    );

    for (const identity of identities) {
      if (groupIdentitiesLookup.has(identity.id)) {
        allocatedCount++;
      }
    }
    const groupAllocatedToAll = allocatedCount === totalIdentitiesCount;
    const groupAllocatedToSome = !groupAllocatedToAll && allocatedCount > 0;

    if (groupAllocatedToAll) {
      groupsAssignedToEveryIdentity.push(group.name);
    }

    if (groupAllocatedToSome) {
      groupsAssignedToSomeIdentities.push(group.name);
    }
  }

  return {
    groupsAssignedToEveryIdentity,
    groupsAssignedToSomeIdentities,
  };
};

// Given a set of groups that should be allocated to all identities and,
// Given a set of groups that should be allocated to some identities
// Generate groups to be assigned to each identity
// For groups that should be allocated to only some identities, only allocate to identities that previously had those groups
export const generateGroupAllocationsForIdentities = (args: {
  groupsForAllIdentities: string[];
  groupsForSomeIdentities: string[];
  identities: LxdIdentity[];
}) => {
  const { groupsForAllIdentities, groupsForSomeIdentities, identities } = args;
  const newGroupsForIdentities: Record<string, string[]> = {};
  for (const identity of identities) {
    const existingGroupsForIdentity = new Set(identity.groups);
    if (!newGroupsForIdentities[identity.id]) {
      newGroupsForIdentities[identity.id] = [];
    }

    newGroupsForIdentities[identity.id] = [...groupsForAllIdentities];

    for (const group of groupsForSomeIdentities) {
      if (existingGroupsForIdentity.has(group)) {
        newGroupsForIdentities[identity.id].push(group);
      }
    }
  }

  return newGroupsForIdentities;
};

export const getChangesInGroupsForIdentities = (args: {
  identities: LxdIdentity[];
  newGroups: string[];
  modifiedGroups: Set<string>;
}) => {
  const { identities, newGroups, modifiedGroups } = args;
  const newGroupsLookup = new Set(newGroups.map((group) => group));

  const identityGroupsChangeSummary: IdentitiesOrGroupsChangeSummary = {};

  for (const identity of identities) {
    const groupsAddedForIdentity: Set<string> = new Set();
    const groupsRemovedForIdentity: Set<string> = new Set();

    // given a set of groups, for each identity check if each group is an addition
    const existingIdentityGroupsLookup = new Set(identity.groups);
    for (const newGroup of newGroups) {
      if (!existingIdentityGroupsLookup.has(newGroup)) {
        groupsAddedForIdentity.add(newGroup);
      }
    }

    // Also check the reverse, if a group previously existed for the identity and is not part of the new groups, then that's a removal
    for (const existingGroup of identity.groups || []) {
      // We need to check if a group is modified, sometime the group can be allocated to only some identities
      // In this case the group was not modified and is not within selectedGroups, this will result in the group being identified as removed from the identity
      if (!modifiedGroups.has(existingGroup)) {
        continue;
      }

      if (!newGroupsLookup.has(existingGroup)) {
        groupsRemovedForIdentity.add(existingGroup);
      }
    }

    // record the changes in groups for an identity, if there are changes
    if (groupsAddedForIdentity.size || groupsRemovedForIdentity.size) {
      identityGroupsChangeSummary[identity.id] = {
        added: groupsAddedForIdentity,
        removed: groupsRemovedForIdentity,
        name: identity.name,
      };
    }
  }

  return identityGroupsChangeSummary;
};

export const pivotIdentityGroupsChangeSummary = (
  identityGroupsChangeSummary: IdentitiesOrGroupsChangeSummary,
) => {
  const identityIds = Object.keys(identityGroupsChangeSummary);
  const groupIdentitiesChangeSummary: IdentitiesOrGroupsChangeSummary = {};

  for (const id of identityIds) {
    const identityGroupsChange = identityGroupsChangeSummary[id];
    // group added to an identity also means the identity is added to the group
    for (const group of identityGroupsChange.added) {
      if (!groupIdentitiesChangeSummary[group]) {
        groupIdentitiesChangeSummary[group] = {
          added: new Set(),
          removed: new Set(),
          name: group,
        };
      }

      groupIdentitiesChangeSummary[group].added.add(identityGroupsChange.name);
    }

    // save logic as above but for removed groups
    for (const group of identityGroupsChange.removed) {
      if (!groupIdentitiesChangeSummary[group]) {
        groupIdentitiesChangeSummary[group] = {
          added: new Set(),
          removed: new Set(),
          name: group,
        };
      }

      groupIdentitiesChangeSummary[group].removed.add(
        identityGroupsChange.name,
      );
    }
  }

  return groupIdentitiesChangeSummary;
};
