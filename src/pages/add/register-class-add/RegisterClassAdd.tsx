import { Button, Form, Select, Skeleton } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RegisterClassGetType,
  RegisterClassPostType,
} from "../../../types/register-class.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ApiService } from "../../../api/ApiService";
import { queryListRegisterClass } from "../../manage/register-class-manage/RegisterClassManage";
import { queryStudent } from "../../manage/student-manage/StudentManage";
import { queryListSubjectClass } from "../../manage/subject-class-manage/SubjectClassManage";

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

const { getDetailData } = ApiService<RegisterClassGetType>("register_class");
const { updateData, addData } =
  ApiService<RegisterClassPostType>("register_class");

export default function RegisterClassAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddRegisterClassPage = pathname.includes("add-register-class");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const registerClassQuery = useQuery({
    queryKey: ["register-class", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddRegisterClassPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (registerClassQuery.isSuccess || registerClassQuery.data) {
      form.setFieldsValue(registerClassQuery.data);
    }
  }, [registerClassQuery.data, registerClassQuery.isSuccess]);

  const updateRegisterClassMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["register-class", id], data);
      toast.success(`Updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["register-list-class"] });
      await queryClient.prefetchQuery(queryListRegisterClass(1, 10));
      navigate("/register-class-manage");
    },
    mutationFn: (registerClass: RegisterClassPostType) =>
      updateData(registerClass),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addRegisterClassMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["register-class", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["register-list-class"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (registerClass: RegisterClassPostType) =>
      addData(registerClass),
    onError: (error) => {
      console.log(error);
    },
  });

  const studentsQuery = useQuery(queryStudent(1, 1000, "", "getFull"));
  const subjectsCalssQuery = useQuery(
    queryListSubjectClass(1, 1000, "", "getFull")
  );
  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFinish = (values: RegisterClassPostType) => {
    if (isAddRegisterClassPage) {
      addRegisterClassMutation.mutate(values);
    } else {
      updateRegisterClassMutation.mutate({ ...values, id });
    }
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>
          {isAddRegisterClassPage ? "Add RegisterClass" : "Edit RegisterClass"}
        </h2>
      </div>
      {!isAddRegisterClassPage && registerClassQuery.isLoading ? (
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
            label="Choose Class Subject"
            name="subjectClassId"
            rules={[
              {
                required: true,
                pattern: /^\S.*$/,
                message: "Không để trống",
              },
            ]}
          >
            {!studentsQuery.isLoading && (
              <Select
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={subjectsCalssQuery.data?.listSubjectClass.map(
                  (children) => ({
                    value: children.id,
                    label: `${children.subjectId.subjectName} - ${children.teacherId.firstName} ${children.teacherId.lastName}`,
                  })
                )}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Choose Student"
            name="studentId"
            rules={[
              {
                required: true,
                pattern: /^\S.*$/,
                message: "Không để trống",
              },
            ]}
          >
            {!studentsQuery.isLoading && (
              <Select
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={studentsQuery.data?.studentList.map((children) => ({
                  value: children.id,
                  label: `${children.firstName} ${children.lastName}`,
                }))}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
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
                isAddRegisterClassPage
                  ? addRegisterClassMutation.isPending
                  : updateRegisterClassMutation.isPending
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
