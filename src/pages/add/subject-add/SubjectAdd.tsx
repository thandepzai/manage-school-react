import { Button, Form, Input, InputNumber, Select, Skeleton } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { SubjectType } from "../../../types/subject.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ApiService } from "../../../api/ApiService";
import { querySubject } from "../../manage/subject-manage/SubjectManage";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const { getDetailData, updateData, addData } =
  ApiService<SubjectType>("subject");

export default function SubjectAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddSubjectPage = pathname.includes("add-subject");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const subjectQuery = useQuery({
    queryKey: ["subject", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddSubjectPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (subjectQuery.isSuccess || subjectQuery.data) {
      form.setFieldsValue(subjectQuery.data);
    }
  }, [subjectQuery.data, subjectQuery.isSuccess]);

  const updateSubjectMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["subject", id], data);
      toast.success(`Updated successfully`);

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      await queryClient.prefetchQuery(querySubject(1, 10));

      navigate("/subject-manage");
    },
    mutationFn: (subject: SubjectType) => updateData(subject),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addSubjectMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["subject", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (subject: SubjectType) => addData(subject),
    onError: (error) => {
      console.log(error);
    },
  });

  const onFinish = (values: SubjectType) => {
    if (isAddSubjectPage) {
      addSubjectMutation.mutate(values);
    } else {
      updateSubjectMutation.mutate({ ...values, id });
    }
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>{isAddSubjectPage ? "Add Subject" : "Edit Subject"}</h2>
      </div>
      {!isAddSubjectPage && subjectQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Form
          {...formItemLayout}
          variant="filled"
          style={{ maxWidth: 800, margin: "0 auto" }}
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            label="Name Subject"
            name="subjectName"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Credit Hours"
            name="creditHour"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
            ]}
          >
            <Select>
              <Select.Option value={1}>Tiểu học</Select.Option>
              <Select.Option value={2}>Trung học</Select.Option>
              <Select.Option value={3}>Trung học phổ thông</Select.Option>
              <Select.Option value={4}>Đại học</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                isAddSubjectPage
                  ? addSubjectMutation.isPending
                  : updateSubjectMutation.isPending
              }
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}
