import React, { FC } from "react";
import { Button, MainTable, Row, Tooltip } from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "./util/helpers";
import { queryKeys } from "./util/queryKeys";
import { fetchImageList } from "./api/images";
import NotificationRow from "./components/NotificationRow";
import DeleteImageBtn from "./buttons/images/DeleteImageBtn";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import useNotification from "./util/useNotification";
import usePanelParams from "./util/usePanelParams";

const ImageList: FC = () => {
  const notify = useNotification();
  const panelParams = usePanelParams();

  const { data: images = [], error } = useQuery({
    queryKey: [queryKeys.images],
    queryFn: fetchImageList,
  });

  if (error) {
    notify.failure("Could not load images.", error);
  }

  const headers = [
    { content: "Alias" },
    { content: "Fingerprint", sortKey: "fingerprint" },
    { content: "Public", sortKey: "public", className: "u-align--center" },
    { content: "Description", sortKey: "description" },
    { content: "Arch", sortKey: "architecture", className: "u-align--center" },
    { content: "Type", sortKey: "type", className: "u-align--center" },
    { content: "Size", sortKey: "size", className: "u-align--center" },
    { content: "Upload date", sortKey: "uploaded_at" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = images.map((image) => {
    const actions = (
      <div>
        <Tooltip message="Delete image" position="left">
          <DeleteImageBtn image={image} notify={notify} />
        </Tooltip>
      </div>
    );

    return {
      columns: [
        {
          content: image.aliases.map((data) => data.name).join(", "),
          role: "rowheader",
          "aria-label": "Alias",
        },
        {
          content: image.fingerprint,
          role: "rowheader",
          "aria-label": "Fingerprint",
        },
        {
          content: image.public ? "yes" : "no",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Public",
        },
        {
          content: image.properties.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: image.architecture,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Architecture",
        },
        {
          content: image.type,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Type",
        },
        {
          content: humanFileSize(image.size),
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Size",
        },
        {
          content: isoTimeToString(image.uploaded_at),
          role: "rowheader",
          "aria-label": "Upload date",
        },
        {
          content: actions,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        fingerprint: image.fingerprint,
        public: image.public,
        description: image.properties.description.toLowerCase(),
        architecture: image.architecture,
        type: image.type,
        size: image.size,
        uploaded_at: image.uploaded_at,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Images"
        controls={
          <Button appearance="positive" onClick={panelParams.openImageImport}>
            Import image
          </Button>
        }
      >
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ImageList;
