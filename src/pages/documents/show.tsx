import { useShow } from "@refinedev/core";
import { Show, TextField } from "@refinedev/antd";
import { Typography } from "antd";
import { IDocument } from "../../interfaces";

const { Title, Text } = Typography;

export const DocumentShow = () => {
  const { queryResult } = useShow<IDocument>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      {/* Assuming you have an 'id' field */}
      <Title level={5}>Id</Title>
      <Text>{record?.id}</Text>

      {/* Assuming you have an 'abstract' field */}
      <Title level={5}>Abstract</Title>
      <TextField value={record?.abstract} />

      {/* Repeat for each relevant field in your document schema */}
      <Title level={5}>Action</Title>
      <TextField value={record?.action} />

      <Title level={5}>Agencies</Title>
      <TextField value={record?.agencies} />

      <Title level={5}>Agency Names</Title>
      <TextField value={record?.agency_names} />

      {/* If body_html_url is a URL, you might want to display it as a link */}
      <Title level={5}>Document</Title>
      <Text>
        <a href={record?.body_html_url} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
      </Text>
      {/* ... other fields ... */}
    </Show>
  );
};
