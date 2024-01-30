import { useState } from "react";
import { Button, Modal, Skeleton, Table, Tag } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { GetListTeacherType, TeacherType } from "../../../types/teacher.type";
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
  handlecChangeModal: (id: string) => void;
  handleToEdit: (id: string) => void;
}
const columns = ({ handlecChangeModal, handleToEdit }: IColumn) => [
  {
    title: "Name",
    key: "name",
    render: (record: TeacherType) => `${record.firstName} ${record.lastName}`,
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
    title: "Year Start",
    dataIndex: "yearStartTeaching",
  },
  {
    title: "Status",
    dataIndex: "teachingStatus", //active unactivate
    render: (record: string) => (
      <Tag color={`${record === "active" ? "green" : "gray"}`}>{record}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (record: TeacherType) => (
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
const { getListData, deleteData } = ApiService<TeacherType>("teacher");

export const queryTeacher = (
  page: number,
  pageSize: number,
  keySearch: string = "",
  valueSearch: string = ""
) => ({
  queryKey: ["teachers", page, valueSearch],
  queryFn: () =>
    getListData<GetListTeacherType>(page, pageSize, keySearch, valueSearch),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 40,
  gcTime: Infinity,
});

export default function TeacherManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [idFocus, setIdFocus] = useState("");
  const [keySearch, setKeySearch] = useState("");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const teachersQuery = useQuery(
    queryTeacher(page, LIMIT, "fullName", keySearch)
  );

  const totalTeachersCount = teachersQuery.data?.count;

  const deleteTeacherMutation = useMutation({
    mutationFn: () => deleteData(idFocus),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.prefetchQuery(
        queryTeacher(page, LIMIT, "fullName", keySearch)
      );
      toast.success(`Delete success teacher`);
      setIsModalOpen(false);
    },
  });

  const handleToAdd = () => {
    navigate("add-teacher");
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
    deleteTeacherMutation.mutate();
  };

  //Search
  const onSearch: SearchProps["onSearch"] = (value, _e) => {
    setKeySearch(value);
    setPage(1);
  };

  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <div style={{ width: "100%", textAlign: "center", margin: "15px 0" }}>
        <h1>List Teacher</h1>
        <Search
          placeholder="Search"
          onSearch={onSearch}
          enterButton
          style={{ width: "80%" }}
        />
      </div>
      <Button
        type="primary"
        style={{ margin: "10px 0px", fontWeight: "bold" }}
        onClick={handleToAdd}
      >
        Add Teacher
      </Button>

      {teachersQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Table
          style={{ opacity: `${teachersQuery.isFetching ? "0.5" : "1"}` }}
          columns={columns({ handlecChangeModal, handleToEdit })}
          dataSource={teachersQuery.data?.teacherList.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={{
            total: totalTeachersCount,
            pageSize: LIMIT,
            onChange: (newPage: number) => {
              setPage(newPage);
            },
          }}
        />
      )}

      <Modal
        title="Delete Teacher"
        open={isModalOpen}
        onOk={handleDelete}
        confirmLoading={deleteTeacherMutation.isPending}
        onCancel={() => handlecChangeModal()}
      >
        <p>Are you sure you want to delete this teacher?</p>
      </Modal>
    </div>
  );
}
