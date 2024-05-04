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

      <Title level={5}>Abstract</Title>
      <TextField value={record?.abstract} />

      <Title level={5}>Agency Names</Title>
      <TextField value={record?.agency_names} />
    </Show>
  );
};
