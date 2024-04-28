import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import { IDocument } from "../../interfaces";

export const DocumentEdit = () => {
  const { formProps, saveButtonProps } = useForm<IDocument>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Abstract"
          name="abstract"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Action"
          name="action"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        {/* Add more Form.Items for each field in your document */}
        {/* For fields that are arrays or objects, you will need to create more complex form items */}
        <Form.Item
          label="Agencies"
          name="agencies"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Agency Names"
          name="agency_names"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Body HTML URL"
          name="body_html_url"
          rules={[{ type: 'url' }]}
        >
          <Input />
        </Form.Item>
        {/* ... other fields ... */}
      </Form>
    </Edit>
  );
};
