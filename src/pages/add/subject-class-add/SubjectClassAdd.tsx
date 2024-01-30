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
import {
  SubjectClassGetType,
  SubjectClassPostType,
} from "../../../types/subject-class.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { queryTeacher } from "../../manage/teacher-manage/TeacherManage";
import { querySubject } from "../../manage/subject-manage/SubjectManage";
import { ApiService } from "../../../api/ApiService";
import { queryListSubjectClass } from "../../manage/subject-class-manage/SubjectClassManage";
import moment from "moment";

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

const { getDetailData } = ApiService<SubjectClassGetType>("subjectclass");
const { updateData, addData } =
  ApiService<SubjectClassPostType>("subjectclass");

export default function SubjectClassAdd() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const listPathname = pathname.split("/");
  const isAddSubjectClassPage = pathname.includes("add-subject-class");

  const id = listPathname[listPathname.length - 1];
  const queryClient = useQueryClient();

  //Update
  const subjectClassQuery = useQuery({
    queryKey: ["subject-class", id],
    queryFn: () => getDetailData(id as string),
    enabled: !isAddSubjectClassPage,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (subjectClassQuery.isSuccess || subjectClassQuery.data) {
      form.setFieldsValue({
        ...subjectClassQuery.data,
        startAt: moment(subjectClassQuery.data.startAt),
        endAt: moment(subjectClassQuery.data.endAt),
        subjectId: subjectClassQuery.data.subjectId.id,
        teacherId: subjectClassQuery.data.teacherId.id,
      });
    }
  }, [subjectClassQuery.data, subjectClassQuery.isSuccess]);

  const updateSubjectClassMutation = useMutation({
    onSuccess: async (data) => {
      queryClient.setQueryData(["subject-class", id], data);
      toast.success(`Updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["subjects-class"] });
      await queryClient.prefetchQuery(queryListSubjectClass(1, 10));

      navigate("/subject-class-manage");
    },
    mutationFn: (subjectClass: SubjectClassPostType) =>
      updateData(subjectClass),
    onError: (error) => {
      console.log(error);
    },
  });

  // Add
  const addSubjectClassMutation = useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(["subject-class", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["subjects-class"] });
      toast.success(`Added successfully`);
      form.resetFields();
    },
    mutationFn: (subjectClass: SubjectClassPostType) => addData(subjectClass),
    onError: (error) => {
      console.log(error);
    },
  });

  const teachersQuery = useQuery(queryTeacher(1, 1000, "", "getFull"));
  const subjectsQuery = useQuery(querySubject(1, 1000, "", "getFull"));

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFinish = (values: SubjectClassPostType) => {
    if (isAddSubjectClassPage) {
      addSubjectClassMutation.mutate(values);
    } else {
      updateSubjectClassMutation.mutate({ ...values, id });
    }
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <h2>
          {isAddSubjectClassPage ? "Add SubjectClass" : "Edit SubjectClass"}
        </h2>
      </div>
      {!isAddSubjectClassPage && subjectClassQuery.isLoading ? (
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
            label="Choose Subject"
            name="subjectId"
            rules={[
              {
                required: true,
                pattern: /^\S.*$/,
                message: "Không để trống",
              },
            ]}
          >
            {!subjectsQuery.isLoading && (
              <Select
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={subjectsQuery.data?.subjectList.map((children) => ({
                  value: children.id,
                  label: children.subjectName,
                }))}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Choose Teacher"
            name="teacherId"
            rules={[
              {
                required: true,
                pattern: /^\S.*$/,
                message: "Không để trống",
              },
            ]}
          >
            {!subjectsQuery.isLoading && (
              <Select
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
                filterOption={filterOption}
                options={teachersQuery.data?.teacherList.map((children) => ({
                  value: children.id,
                  label: `${children.firstName} ${children.lastName}`,
                }))}
              />
            )}
          </Form.Item>

          <Form.Item
            label="Max Quantity"
            name="maxQuantity"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Min Quantity"
            name="minQuantity"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Start Time"
            name="startAt"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endAt"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Class Room"
            name="classRoom"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Academic Year"
            name="academicYear"
            rules={[
              { required: true, pattern: /^\S.*$/, message: "Required field" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="classStatus"
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
                isAddSubjectClassPage
                  ? addSubjectClassMutation.isPending
                  : updateSubjectClassMutation.isPending
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
