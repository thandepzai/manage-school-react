import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { TeacherType } from "../../../types/teacher.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { ApiService } from "../../../api/ApiService";
import { queryTeacher } from "../../manage/teacher-manage/TeacherManage";
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

const { getDetailData, updateData, addData } =
  ApiService<TeacherType>("teacher");

export default function TeacherAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddTeacherPage = pathname.includes("add-teacher");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const teacherQuery = useQuery({
    queryKey: ["teacher", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddTeacherPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (teacherQuery.isSuccess || teacherQuery.data) {
      form.setFieldsValue({
        ...teacherQuery.data,
        dateOfBirth: moment(teacherQuery.data.dateOfBirth),
      });
    }
  }, [teacherQuery.data, teacherQuery.isSuccess]);

  const updateTeacherMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["teacher", id], data);
      toast.success(`Updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["teachers"] });

      await queryClient.prefetchQuery(queryTeacher(1, 10));

      navigate("/teacher-manage");
    },
    mutationFn: (teacher: TeacherType) => updateData(teacher),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addTeacherMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["teacher", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (teacher: TeacherType) => addData(teacher),
    onError: (error) => {
      console.log(error);
    },
  });

  const onFinish = (values: TeacherType) => {
    if (isAddTeacherPage) {
      addTeacherMutation.mutate(values);
    } else {
      updateTeacherMutation.mutate({ ...values, id });
    }
  };

  const schoolsQuery = useQuery(querySchool(1, 1000, "", "getFull"));

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>{isAddTeacherPage ? "Add Teacher" : "Edit Teacher"}</h2>
      </div>
      {!isAddTeacherPage && teacherQuery.isLoading ? (
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
            label="First Name"
            name="firstName"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
              { type: "email", message: "Invalid email address" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
              {
                pattern: /^(\+84|0[3|5|7|8|9])+([0-9]{7,13})\b/,
                message: "Invalid phone number format",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Select>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date of birth"
            name="dateOfBirth"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Start year of teaching"
            name="yearStartTeaching"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="School"
            name="schoolId"
            rules={[
              {
                required: true,
                pattern: /^\S.*$/,
                message: "Không để trống",
              },
            ]}
          >
            {!schoolsQuery.isLoading && (
              <Select
                showSearch
                optionFilterProp="children"
                style={{ width: "100%", marginBottom: "10px" }}
                filterOption={filterOption}
                options={schoolsQuery.data?.schoolList.map((children) => ({
                  value: children.id,
                  label: children.schoolName,
                }))}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Status"
            name="teachingStatus"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">InActive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                isAddTeacherPage
                  ? addTeacherMutation.isPending
                  : updateTeacherMutation.isPending
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
