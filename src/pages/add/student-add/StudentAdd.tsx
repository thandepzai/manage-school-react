import { Button, DatePicker, Form, Input, Select, Skeleton } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { StudentType } from "../../../types/student.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { ApiService } from "../../../api/ApiService";
import { queryStudent } from "../../manage/student-manage/StudentManage";
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
  ApiService<StudentType>("student");

export default function StudentAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddStudentPage = pathname.includes("add-student");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const studentQuery = useQuery({
    queryKey: ["student", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddStudentPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (studentQuery.isSuccess || studentQuery.data) {
      form.setFieldsValue({
        ...studentQuery.data,
        dateOfBirth: moment(studentQuery.data.dateOfBirth),
      });
    }
  }, [studentQuery.data, studentQuery.isSuccess]);

  const updateStudentMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["student", id], data);
      toast.success(`Updated successfully`);

      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
      await queryClient.prefetchQuery(queryStudent(1, 10));

      navigate("/student-manage");
    },
    mutationFn: (student: StudentType) => updateData(student),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addStudentMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["student", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (student: StudentType) => addData(student),
    onError: (error) => {
      console.log(error);
    },
  });

  const schoolsQuery = useQuery(querySchool(1, 1000, "", "getFull"));

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFinish = (values: StudentType) => {
    if (isAddStudentPage) {
      addStudentMutation.mutate(values);
    } else {
      updateStudentMutation.mutate({ ...values, id });
    }
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>{isAddStudentPage ? "Add Student" : "Edit Student"}</h2>
      </div>
      {!isAddStudentPage && studentQuery.isLoading ? (
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
            label="Date of birth"
            name="dateOfBirth"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
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
            label="Status"
            name="enrollmentStatus"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">InActive</Select.Option>
            </Select>
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
                isAddStudentPage
                  ? addStudentMutation.isPending
                  : updateStudentMutation.isPending
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
