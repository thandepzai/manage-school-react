import { useState } from "react";
import { Button, Modal, Select, Skeleton, Table } from "antd";
import { useNavigate } from "react-router-dom";
import {
  GetListRegisterClassType,
  RegisterClassGetType,
} from "../../../types/register-class.type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { TeacherType } from "../../../types/teacher.type";
import { StudentType } from "../../../types/student.type";
import { ApiService } from "../../../api/ApiService";
import { queryStudent } from "../student-manage/StudentManage";
import { queryListSubjectClass } from "../subject-class-manage/SubjectClassManage";

interface IColumn {
  handleToEdit: (id: string) => void;
  handlecChangeModal: (id: string) => void;
}
const columns = ({ handlecChangeModal, handleToEdit }: IColumn) => [
  {
    title: "Student Name",
    dataIndex: ["studentId"],
    render: (studentId: StudentType) =>
      `${studentId.firstName} ${studentId.lastName}`,
  },
  {
    title: "Subject Name",
    dataIndex: ["subjectClassId", "subjectId", "subjectName"],
  },
  {
    title: "Teacher Name",
    dataIndex: ["subjectClassId", "teacherId"],
    render: (teacherId: TeacherType) =>
      `${teacherId.firstName} ${teacherId.lastName}`,
  },
  {
    title: "Action",
    key: "action",
    render: (record: RegisterClassGetType) => (
      <>
        <Button
          type="link"
          onClick={() => handleToEdit(record.id)}
          style={{ fontWeight: "bold" }}
        >
          Edit
        </Button>
        <Button
          type="link"
          onClick={() => handlecChangeModal(record.id)}
          style={{ fontWeight: "bold" }}
          danger
        >
          Delete
        </Button>
      </>
    ),
  },
];

const LIMIT = 10;
const { getListData, deleteData } =
  ApiService<RegisterClassGetType>("register_class");

export const queryListRegisterClass = (
  page: number,
  pageSize: number,
  keySearch: string = "",
  valueSearch: string = "",
  keySearchSecond: string = "",
  valueSearchSecond: string = ""
) => ({
  queryKey: ["register-list-class", page, valueSearch, valueSearchSecond],
  queryFn: () =>
    getListData<GetListRegisterClassType>(
      page,
      pageSize,
      keySearch,
      valueSearch,
      keySearchSecond,
      valueSearchSecond
    ),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 40,
  gcTime: Infinity,
});

export default function RegisterClassManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [idFocus, setIdFocus] = useState("");
  const [idFilter, setIdFilter] = useState({
    studentId: "",
    subjectClassId: "",
  });
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const registerClassQuery = useQuery(
    queryListRegisterClass(
      page,
      LIMIT,
      "studentId",
      idFilter.studentId,
      "subjectClassId",
      idFilter.subjectClassId
    )
  );
  const totalRegisterClassCount = registerClassQuery.data?.count;

  const deleteRegisterClassMutation = useMutation({
    mutationFn: () => deleteData(idFocus),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["register-list-classs"] });
      await queryClient.prefetchQuery(
        queryListRegisterClass(
          page,
          LIMIT,
          "studentId",
          idFilter.studentId,
          "subjectClassId",
          idFilter.subjectClassId
        )
      );
      toast.success(`Delete success register-class`);
      setIsModalOpen(false);
    },
  });

  const handleToAdd = () => {
    navigate("add-register-class");
  };

  const handleToEdit = (id: string) => {
    navigate(`${id}`);
  };

  const handlecChangeModal = (id?: string) => {
    if (!isModalOpen && id) {
      setIdFocus(id);
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleDelete = () => {
    deleteRegisterClassMutation.mutate();
  };

  // Filter
  const studentsQuery = useQuery(queryStudent(1, 1000, "", "getFull"));
  const subjectsCalssQuery = useQuery(
    queryListSubjectClass(1, 1000, "", "getFull")
  );
  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <div style={{ width: "100%", textAlign: "center", margin: "15px 0" }}>
        <h1>List Register Class</h1>
      </div>
      <Button
        type="primary"
        style={{ margin: "10px 5px", fontWeight: "bold" }}
        onClick={handleToAdd}
      >
        Add Register Class
      </Button>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h3>Filter: </h3>
        <Select
          showSearch
          mode="multiple"
          style={{ minWidth: "200px" }}
          optionFilterProp="children"
          placeholder="Select Students"
          onChange={(e) => setIdFilter({ ...idFilter, studentId: e })}
          filterOption={filterOption}
          options={studentsQuery.data?.studentList.map((children) => ({
            value: children.id,
            label: `${children.firstName} ${children.lastName}`,
          }))}
        />
        <Select
          showSearch
          mode="multiple"
          style={{ minWidth: "200px" }}
          optionFilterProp="children"
          placeholder="Select Subject"
          onChange={(e) => setIdFilter({ ...idFilter, subjectClassId: e })}
          filterOption={filterOption}
          options={subjectsCalssQuery.data?.listSubjectClass.map(
            (children) => ({
              value: children.id,
              label: children.subjectId.subjectName,
            })
          )}
        />
      </div>
      {registerClassQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Table
          style={{ opacity: `${registerClassQuery.isFetching ? "0.5" : "1"}` }}
          columns={columns({ handlecChangeModal, handleToEdit })}
          dataSource={registerClassQuery.data?.registerClassList.map(
            (item) => ({
              ...item,
              key: item.id,
            })
          )}
          pagination={{
            total: totalRegisterClassCount,
            pageSize: LIMIT,
            onChange: (newPage: number) => {
              setPage(newPage);
            },
          }}
        />
      )}

      <Modal
        title="Delete RegisterClass"
        open={isModalOpen}
        onOk={handleDelete}
        confirmLoading={deleteRegisterClassMutation.isPending}
        onCancel={() => handlecChangeModal()}
      >
        <p>Are you sure you want to delete this register-class?</p>
      </Modal>
    </div>
  );
}
