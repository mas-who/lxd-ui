import { LxdGroup, LxdIdentity } from "types/permissions";
import {
  getCurrentGroupAllocationsForIdentities,
  generateGroupAllocationsForIdentities,
  getChangesInGroupsForIdentities,
  pivotIdentityGroupsChangeSummary,
} from "./permissionIdentities";

describe("Permissions util functions for identities page", () => {
  it("getCurrentGroupAllocationsForIdentities", () => {
    const groups = [
      {
        name: "group-1",
        identities: {
          oidc: ["user-1"],
          tls: ["user-2"],
        },
      },
      {
        name: "group-2",
        identities: {
          oidc: ["user-1", "user-3"],
          tls: ["user-2"],
        },
      },
      {
        name: "group-3",
        identities: {
          oidc: [],
          tls: [],
        },
      },
    ] as LxdGroup[];

    const identities = [
      {
        id: "user-1",
      },
      {
        id: "user-2",
      },
      {
        id: "user-3",
      },
    ] as LxdIdentity[];

    const { groupsAssignedToEveryIdentity, groupsAssignedToSomeIdentities } =
      getCurrentGroupAllocationsForIdentities(groups, identities);

    expect(groupsAssignedToEveryIdentity).toEqual(["group-2"]);
    expect(groupsAssignedToSomeIdentities).toEqual(["group-1"]);
  });

  it("generateGroupAllocationsForIdentities", () => {
    const groupsForAllIdentities = ["group-1"];
    const groupsForSomeIdentities = ["group-2"];
    const identities = [
      {
        id: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        groups: ["group-2"],
      },
      {
        id: "user-3",
        groups: ["group-3"],
      },
    ] as LxdIdentity[];
    const groupsForIdentities = generateGroupAllocationsForIdentities({
      groupsForAllIdentities,
      groupsForSomeIdentities,
      identities,
    });

    expect(groupsForIdentities).toEqual({
      "user-1": ["group-1", "group-2"],
      "user-2": ["group-1", "group-2"],
      "user-3": ["group-1"],
    });
  });

  it("getChangesInGroupsForIdentities", () => {
    // user action:
    // - remove group-1 for user-1 and user-2
    // - add group-3 an group-4 for user-1 and user-2
    const identities = [
      {
        id: "user-1",
        name: "user-1",
        groups: ["group-1", "group-2"],
      },
      {
        id: "user-2",
        name: "user-2",
        groups: ["group-1"],
      },
    ] as LxdIdentity[];

    const newGroups = ["group-3", "group-4"];
    const modifiedGroups = new Set(["group-1", "group-3", "group-4"]);
    const identityGroupsChangeSummary = getChangesInGroupsForIdentities({
      identities,
      newGroups,
      modifiedGroups,
    });

    expect(identityGroupsChangeSummary).toEqual({
      "user-1": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-2",
      },
    });
  });

  it("pivotIdentityGroupsChangeSummary", () => {
    const identityGroupsChangeSummary = {
      "user-1": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-1",
      },
      "user-2": {
        added: new Set(["group-3", "group-4"]),
        removed: new Set(["group-1"]),
        name: "user-2",
      },
    };

    const groupIdentitiesChangeSummary = pivotIdentityGroupsChangeSummary(
      identityGroupsChangeSummary,
    );

    expect(groupIdentitiesChangeSummary).toEqual({
      "group-1": {
        added: new Set(),
        removed: new Set(["user-1", "user-2"]),
        name: "group-1",
      },
      "group-3": {
        added: new Set(["user-1", "user-2"]),
        removed: new Set(),
        name: "group-3",
      },
      "group-4": {
        added: new Set(["user-1", "user-2"]),
        removed: new Set(),
        name: "group-4",
      },
    });
  });
});
