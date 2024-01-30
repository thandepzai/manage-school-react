import { Button, Form, Input, InputNumber, Select, Skeleton } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { SchoolType } from "../../../types/school.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ApiService } from "../../../api/ApiService";
import { querySchool } from "../../manage/school-manage/SchoolManage";

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

const { getDetailData, updateData, addData } = ApiService<SchoolType>("school");

export default function SchoolAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddSchoolPage = pathname.includes("add-school");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const schoolQuery = useQuery({
    queryKey: ["school", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddSchoolPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (schoolQuery.isSuccess || schoolQuery.data) {
      form.setFieldsValue(schoolQuery.data);
    }
  }, [schoolQuery.data, schoolQuery.isSuccess]);

  const updateSchoolMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["school", id], data);
      toast.success(`Updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      await queryClient.prefetchQuery(querySchool(1, 10));

      navigate("/school-manage");
    },
    mutationFn: (school: SchoolType) => updateData(school),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addSchoolMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["school", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (school: SchoolType) => addData(school),
    onError: (error) => {
      console.log(error);
    },
  });

  const onFinish = (values: SchoolType) => {
    if (isAddSchoolPage) {
      addSchoolMutation.mutate(values);
    } else {
      updateSchoolMutation.mutate({ ...values, id });
    }
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>{isAddSchoolPage ? "Add School" : "Edit School"}</h2>
      </div>
      {!isAddSchoolPage && schoolQuery.isLoading ? (
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
            label="Tên trường"
            name="schoolName"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="hotline"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
              {
                pattern: /^(\+84|0[3|5|7|8|9])+([0-9]{7,13})\b/,
                message: "Số điện thoại không đúng định dạng",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Năm thành lập"
            name="dateEstablished"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Không để trống" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Level"
            name="typeOfEducation"
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

          <Form.Item label="Giới thiệu" name="description">
            <Input.TextArea />
          </Form.Item>
          
          <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                isAddSchoolPage
                  ? addSchoolMutation.isPending
                  : updateSchoolMutation.isPending
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
