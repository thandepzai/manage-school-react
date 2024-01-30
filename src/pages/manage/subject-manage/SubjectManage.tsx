import { useState } from "react";
import { Button, Modal, Skeleton, Table } from "antd";
import Search, { SearchProps } from "antd/es/input/Search";
import { useNavigate } from "react-router-dom";
import { GetListSubjectType, SubjectType } from "../../../types/subject.type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ApiService } from "../../../api/ApiService";

interface IColumn {
  handleToEdit: (id: string) => void;
  handlecChangeModal: (id: string) => void;
}
const columns = ({ handlecChangeModal, handleToEdit }: IColumn) => [
  {
    title: "Name",
    dataIndex: "subjectName",
  },
  {
    title: "Credit Hours",
    dataIndex: "creditHour",
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
    title: "Action",
    key: "action",
    render: (record: SubjectType) => (
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
const { getListData, deleteData } = ApiService<SubjectType>("subject");

export const querySubject = (
  page: number,
  pageSize: number,
  keySearch: string = "",
  valueSearch: string = ""
) => ({
  queryKey: ["subjects", page, valueSearch],
  queryFn: () =>
    getListData<GetListSubjectType>(page, pageSize, keySearch, valueSearch),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 40,
  gcTime: Infinity,
});

export default function SubjectManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [keySearch, setKeySearch] = useState("");
  const [idFocus, setIdFocus] = useState("");
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const subjectsQuery = useQuery(querySubject(page, LIMIT, "subjectName", keySearch));

  const totalSubjectsCount = subjectsQuery.data?.count;

  const deleteSubjectMutation = useMutation({
    mutationFn: () => deleteData(idFocus),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      await queryClient.prefetchQuery(querySubject(page, LIMIT, "subjectName", keySearch));
      toast.success(`Delete success subject`);
      setIsModalOpen(false);
    },
  });

  const onSearch: SearchProps["onSearch"] = (value, _e) => {
    setKeySearch(value)
    setPage(1);
  }

  const handleToAdd = () => {
    navigate("add-subject");
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
    deleteSubjectMutation.mutate();
  };

  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <div style={{ width: "100%", textAlign: "center", margin: "15px 0" }}>
        <h1>List Subject</h1>
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
        Add Subject
      </Button>
      {subjectsQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Table
          style={{ opacity: `${subjectsQuery.isFetching ? "0.5" : "1"}` }}
          columns={columns({ handlecChangeModal, handleToEdit })}
          dataSource={subjectsQuery.data?.subjectList.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={{
            total: totalSubjectsCount,
            pageSize: LIMIT,
            onChange: (newPage: number) => {
              setPage(newPage);
            },
          }}
        />
      )}

      <Modal
        title="Delete Subject"
        open={isModalOpen}
        onOk={handleDelete}
        confirmLoading={deleteSubjectMutation.isPending}
        onCancel={() => handlecChangeModal()}
      >
        <p>Are you sure you want to delete this subject?</p>
      </Modal>
    </div>
  );
}
