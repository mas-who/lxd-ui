import { watchOperation } from "./operations";
import { handleResponse } from "../util/helpers";
import { LxdSnapshot } from "../types/instance";

export const fetchSnapshots = (
  instanceName: string | null | undefined
): Promise<LxdSnapshot[]> => {
  return new Promise((resolve, reject) => {
    return fetch(`/1.0/instances/${instanceName}/snapshots?recursion=1`)
      .then(handleResponse)
      .then((data) => resolve(data.metadata))
      .catch(reject);
  });
};

export const createSnapshot = (
  instanceName: string,
  name: string,
  expiresAt: string | null,
  stateful: boolean
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instanceName}/snapshots`, {
      method: "POST",
      body: JSON.stringify({
        name,
        expires_at: expiresAt,
        stateful,
      }),
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const deleteSnapshot = (instanceName: string, snapshot: LxdSnapshot) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instanceName}/snapshots/${snapshot.name}`, {
      method: "DELETE",
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};

export const restoreSnapshot = (
  instanceName: string,
  snapshot: LxdSnapshot
) => {
  return new Promise((resolve, reject) => {
    fetch(`/1.0/instances/${instanceName}`, {
      method: "PUT",
      body: JSON.stringify({
        restore: snapshot.name,
      }),
    })
      .then(handleResponse)
      .then((data) => {
        watchOperation(data.operation).then(resolve).catch(reject);
      })
      .catch(reject);
  });
};
