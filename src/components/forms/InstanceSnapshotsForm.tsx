import React, { FC, ReactNode } from "react";
import { Icon, Input, Notification, Select } from "@canonical/react-components";
import { optionYesNo } from "util/instanceOptions";
import { SharedFormikTypes, SharedFormTypes } from "./sharedFormTypes";
import { getInstanceConfigurationRow } from "components/forms/InstanceConfigurationRow";
import InstanceConfigurationTable from "components/forms/InstanceConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";
import SnapshotScheduleInput from "components/SnapshotScheduleInput";
import { useProject } from "context/project";
import { isSnapshotsDisabled } from "util/snapshots";
import { useDocs } from "context/useDocs";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: SharedFormTypes) => {
  return {
    [getInstanceKey("snapshots_pattern")]: values.snapshots_pattern,
    [getInstanceKey("snapshots_schedule_stopped")]:
      values.snapshots_schedule_stopped,
    [getInstanceKey("snapshots_schedule")]: values.snapshots_schedule,
    [getInstanceKey("snapshots_expiry")]: values.snapshots_expiry,
  };
};

interface Props {
  formik: SharedFormikTypes;
  children?: ReactNode;
}

const InstanceSnapshotsForm: FC<Props> = ({ formik }) => {
  const { project } = useProject();
  const snapshotDisabled = isSnapshotsDisabled(project);
  const docBaseLink = useDocs();

  return (
    <>
      {snapshotDisabled && (
        <Notification
          severity="caution"
          title="Snapshot creation blocked for the current project"
        >
          Snapshot scheduling settings may not work as expected.{" "}
          <a
            href={`${docBaseLink}/reference/projects/#project-restrictions`}
            target="_blank"
            rel="noreferrer"
          >
            Learn more about project restrictions
            <Icon className="external-link-icon" name="external-link" />
          </a>
        </Notification>
      )}
      <InstanceConfigurationTable
        rows={[
          getInstanceConfigurationRow({
            formik,
            label: "Snapshot name pattern",
            name: "snapshots_pattern",
            defaultValue: "",
            children: <Input placeholder="Enter name pattern" type="text" />,
          }),

          getInstanceConfigurationRow({
            formik,
            label: "Expire after",
            name: "snapshots_expiry",
            defaultValue: "",
            children: (
              <Input placeholder="Enter expiry expression" type="text" />
            ),
          }),

          getInstanceConfigurationRow({
            formik,
            label: "Snapshot stopped instances",
            name: "snapshots_schedule_stopped",
            defaultValue: "",
            readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
            children: <Select options={optionYesNo} />,
          }),

          getInstanceConfigurationRow({
            formik,
            label: "Schedule",
            name: "snapshots_schedule",
            defaultValue: "",
            children: (
              <SnapshotScheduleInput
                value={formik.values.snapshots_schedule}
                setValue={(val) =>
                  void formik.setFieldValue("snapshots_schedule", val)
                }
              />
            ),
          }),
        ]}
      />
    </>
  );
};

export default InstanceSnapshotsForm;
