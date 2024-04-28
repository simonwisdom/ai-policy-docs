import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Typography } from "antd";
import { IDocument } from "../../interfaces";
import "./list.css";

export const DocumentList = () => {
  const { tableProps } = useTable<IDocument>();

  // Explicitly define the columns in the order you want them to appear
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Document Number',
      dataIndex: 'document_number',
      key: 'document_number',
    },
    {
      title: 'Publication Date',
      dataIndex: 'publication_date',
      key: 'publication_date',
    },
    {
      title: 'Agency Names',
      dataIndex: 'agency_names',
      key: 'agency_names',
    },
    {
      title: 'Abstract',
      dataIndex: 'abstract',
      key: 'abstract',
    },
    {
      title: 'Full Text URL',
      dataIndex: 'full_text_url',
      key: 'full_text_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">View Full Text</a> : null,
    },
    {
      title: 'Comment URL',
      dataIndex: 'comment_url',
      key: 'comment_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">Comment</a> : null,
    },
    {
      title: 'Dates',
      dataIndex: 'dates',
      key: 'dates',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: IDocument) => (
        <Space>
          <EditButton hideText size="small" recordItemId={record.id} />
          <ShowButton hideText size="small" recordItemId={record.id} />
          <DeleteButton hideText size="small" recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <List>
      <Table
        {...tableProps}
        rowKey="id"
        columns={columns}
        className="custom-table"
      />
    </List>
  );
};
