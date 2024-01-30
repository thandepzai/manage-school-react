import { useState } from "react";
import { Button, Modal, Skeleton, Table, Tag } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { GetListStudentType, StudentType } from "../../../types/student.type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import moment from "moment";
import { ApiService } from "../../../api/ApiService";

interface IColumn {
  handleToEdit: (id: string) => void;
  handlecChangeModal: (id: string) => void;
}
const columns = ({ handlecChangeModal, handleToEdit }: IColumn) => [
  {
    title: "Name",
    key: "name",
    render: (record: StudentType) => `${record.firstName} ${record.lastName}`,
  },
  {
    title: "Gender",
    dataIndex: "gender",
  },
  {
    title: "Date of Birth",
    dataIndex: "dateOfBirth",
    render: (record: Date) => moment(record).format("YYYY-MM-DD"),
  },
  {
    title: "Address",
    dataIndex: "address",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone",
  },
  {
    title: "Level",
    dataIndex: "level",
    render: (record: number) => {
      if (record === 1) {
        return "Tiểu học";
      }
      if (record === 2) {
        return "Trung học";
      }
      if (record === 3) {
        return "Trung học phổ thông";
      }
      if (record === 4) {
        return "Đại học";
      }
    },
  },
  {
    title: "Status",
    dataIndex: "enrollmentStatus", //active unactivate
    render: (record: string) => (
      <Tag color={`${record === "active" ? "green" : "gray"}`}>{record}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (record: StudentType) => (
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
const { getListData, deleteData } = ApiService<StudentType>("student");

export const queryStudent = (
  page: number,
  pageSize: number,
  keySearch: string = "",
  valueSearch: string = ""
) => ({
  queryKey: ["students", page, valueSearch],
  queryFn: () =>
    getListData<GetListStudentType>(page, pageSize, keySearch, valueSearch),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 40,
  gcTime: Infinity,
});

export default function StudentManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [keySearch, setKeySearch] = useState("");
  const [idFocus, setIdFocus] = useState("");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const studentsQuery = useQuery(
    queryStudent(page, LIMIT, "fullName", keySearch)
  );

  const totalStudentsCount = studentsQuery.data?.count;

  const deleteStudentMutation = useMutation({
    mutationFn: () => deleteData(idFocus),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.prefetchQuery(queryStudent(page, LIMIT));
      toast.success(`Delete success student`);
      setIsModalOpen(false);
    },
  });

  const onSearch: SearchProps["onSearch"] = (value, _e) => setKeySearch(value);

  const handleToAdd = () => {
    navigate("add-student");
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
    deleteStudentMutation.mutate();
  };

  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <div style={{ width: "100%", textAlign: "center", margin: "15px 0" }}>
        <h1>List Student</h1>
        <Search
          placeholder="Search"
          onSearch={onSearch}
          enterButton
          style={{ width: "80%" }}
        />
      </div>
      <Button
        type="primary"
        style={{ margin: "10px 5px", fontWeight: "bold" }}
        onClick={handleToAdd}
      >
        Add Student
      </Button>
      {studentsQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Table
          style={{ opacity: `${studentsQuery.isFetching ? "0.5" : "1"}` }}
          columns={columns({ handlecChangeModal, handleToEdit })}
          dataSource={studentsQuery.data?.studentList.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={{
            total: totalStudentsCount,
            pageSize: LIMIT,
            onChange: (newPage: number) => {
              setPage(newPage);
            },
          }}
        />
      )}

      <Modal
        title="Delete Student"
        open={isModalOpen}
        onOk={handleDelete}
        confirmLoading={deleteStudentMutation.isPending}
        onCancel={() => handlecChangeModal()}
      >
        <p>Are you sure you want to delete this student?</p>
      </Modal>
    </div>
  );
}
