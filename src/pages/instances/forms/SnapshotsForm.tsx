import React, { FC, ReactNode, useState } from "react";
import {
  Col,
  Input,
  RadioInput,
  Row,
  Select,
} from "@canonical/react-components";
import { booleanFields } from "util/instanceOptions";
import {
  SharedFormikTypes,
  SharedFormTypes,
} from "pages/instances/forms/sharedFormTypes";
import OverrideField from "pages/instances/forms/OverrideField";

export interface SnapshotFormValues {
  snapshots_pattern?: string;
  snapshots_expiry?: string;
  snapshots_schedule?: string;
  snapshots_schedule_stopped?: string;
}

export const snapshotsPayload = (values: SharedFormTypes) => {
  return {
    ["snapshots.pattern"]: values.snapshots_pattern,
    ["snapshots.schedule.stopped"]: values.snapshots_schedule_stopped,
    ["snapshots.schedule"]: values.snapshots_schedule,
    ["snapshots.expiry"]: values.snapshots_expiry,
  };
};

interface Props {
  formik: SharedFormikTypes;
  children?: ReactNode;
}

const SnapshotsForm: FC<Props> = ({ formik, children }) => {
  const [cronSyntax, setCronSyntax] = useState(
    !formik.values.snapshots_schedule?.startsWith("@")
  );

  return (
    <>
      {children}
      <Row>
        <Col size={8}>
          <OverrideField
            formik={formik}
            label="Snapshot name pattern"
            name="snapshots_pattern"
            defaultValue=""
          >
            <Input
              id="snapshotsPattern"label="Snapshot name pattern"
              placeholder="Enter name pattern"
              help={
                <>
                  Pongo2 template string that represents the snapshot name (used
                  for scheduled snapshots and unnamed snapshots) see{" "}
                  <a
                    className="p-link--external"
                    href="https://linuxcontainers.org/lxd/docs/latest/reference/instance_options/#instance-options-snapshots-names"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Automatic snapshot names
                  </a>
                </>
              }
              name="snapshots_pattern"
              type="text"
              value={formik.values.snapshots_pattern}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </OverrideField>
          <OverrideField
            formik={formik}
            label="Expire after"
            name="snapshots_expiry"
            defaultValue=""
          >
            <Input
              id="snapshotsExpiry"label="Expire after"
              name="snapshots_expiry"
              placeholder="Enter expiration expression"
              help="Controls when snapshots are to be deleted (expects an expression like 1M 2H 3d 4w 5m 6y)"
              type="text"
              value={formik.values.snapshots_expiry}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </OverrideField>
          <OverrideField
            formik={formik}
            label="Snapshot stopped instances"
            name="snapshots_schedule_stopped"
            defaultValue="false"
          >
            <Select
            id="snapshotsScheduleStopped"
              label="Snapshot stopped instances"
              name="snapshots_schedule_stopped"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              options={booleanFields}
              value={formik.values.snapshots_schedule_stopped}
            />
          </OverrideField>
          <hr />
          <OverrideField
            formik={formik}
            label="Schedule in cron syntax"
            name="snapshots_schedule"
            defaultValue=""
          >
            <div>
              <div className="snapshot-schedule">
                <RadioInput
                  labelClassName="right-margin"
                  label="Cron syntax"
                  checked={cronSyntax}
                  onChange={() => {
                    setCronSyntax(true);
                    formik.setFieldValue("snapshots_schedule", "");
                  }}
                />
                <RadioInput
                  label="Manual configuration"
                  checked={!cronSyntax}
                  onChange={() => {
                    setCronSyntax(false);
                    formik.setFieldValue("snapshots_schedule", "@daily");
                  }}
                />
              </div>
              {cronSyntax ? (
                <Input
                  id="snapshotsSchedule"label="Schedule in cron syntax"
                  name="snapshots_schedule"
                  placeholder="Enter cron expression"
                  help="Cron expression (<minute> <hour> <dom> <month> <dow>), a comma-separated list of schedule aliases (@hourly, @daily, @midnight, @weekly, @monthly, @annually, @yearly), or empty to disable automatic snapshots (the default)"
                  type="text"
                  value={formik.values.snapshots_schedule}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
              ) : (
                <>
                  <Selectid="snapshotsSchedule"
                    label="Every"
                    name="snapshots_schedule"
                    value={formik.values.snapshots_schedule}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    options={[
                      {
                        label: "minute",
                        value: "* * * * *",
                      },
                      {
                        label: "hour",
                        value: "@hourly",
                      },
                      {
                        label: "day",
                        value: "@daily",
                      },
                      {
                        label: "week",
                        value: "@weekly",
                      },
                      {
                        label: "month",
                        value: "@monthly",
                      },
                      {
                        label: "year",
                        value: "@yearly",
                      },
                    ]}
                  />
                </>
              )}
            </div>
          </OverrideField>
        </Col>
      </Row>
    </>
  );
};

export default SnapshotsForm;
