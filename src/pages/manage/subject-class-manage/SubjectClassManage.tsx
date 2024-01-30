import { useState } from "react";
import { Button, Modal, Select, Skeleton, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import {
  GetListSubjectClassType,
  SubjectClassGetType,
} from "../../../types/subject-class.type";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import moment from "moment";
import { TeacherType } from "../../../types/teacher.type";
import { ApiService } from "../../../api/ApiService";
import { queryTeacher } from "../teacher-manage/TeacherManage";
import { querySubject } from "../subject-manage/SubjectManage";

interface IColumn {
  handleToEdit: (id: string) => void;
  handlecChangeModal: (id: string) => void;
}
const columns = ({ handlecChangeModal, handleToEdit }: IColumn) => [
  {
    title: "Subject Name",
    dataIndex: ["subjectId", "subjectName"],
  },
  {
    title: "Teacher Name",
    dataIndex: "teacherId",
    render: (teacherId: TeacherType) =>
      `${teacherId.firstName} ${teacherId.lastName}`,
  },
  {
    title: "Level",
    dataIndex: ["subjectId", "level"],
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
    title: "Max Quantity",
    dataIndex: "maxQuantity",
  },
  {
    title: "Min Quantity",
    dataIndex: "minQuantity",
  },
  {
    title: "Start At",
    dataIndex: "startAt",
    render: (record: Date) => moment(record).format("YYYY-MM-DD"),
  },
  {
    title: "End At",
    dataIndex: "endAt",
    render: (record: Date) => moment(record).format("YYYY-MM-DD"),
  },
  {
    title: "Name Class",
    dataIndex: "classRoom",
  },
  {
    title: "Acaemic Year",
    dataIndex: "academicYear",
  },
  {
    title: "Status",
    dataIndex: "classStatus", //active unactivate
    render: (record: string) => (
      <Tag color={`${record === "active" ? "green" : "gray"}`}>{record}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (record: SubjectClassGetType) => (
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
  ApiService<SubjectClassGetType>("subjectclass");

export const queryListSubjectClass = (
  page: number,
  pageSize: number,
  keySearch: string = "",
  valueSearch: string = "",
  keySearchSecond: string = "",
  valueSearchSecond: string = ""
) => ({
  queryKey: ["subjects-class", page, valueSearch, valueSearchSecond],
  queryFn: () =>
    getListData<GetListSubjectClassType>(
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

export default function SubjectClassManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [idFocus, setIdFocus] = useState("");
  const [idFilter, setIdFilter] = useState({ teacherId: "", subjectId: "" });
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const subjectClassQuery = useQuery(
    queryListSubjectClass(
      page,
      LIMIT,
      "teacherId",
      idFilter.teacherId,
      "subjectId",
      idFilter.subjectId
    )
  );
  const totalSubjectClassCount = subjectClassQuery.data?.count;

  const deleteSubjectClassMutation = useMutation({
    mutationFn: () => deleteData(idFocus),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-class"] });
      await queryClient.prefetchQuery(
        queryListSubjectClass(
          page,
          LIMIT,
          "teacherId",
          idFilter.teacherId,
          "subjectId",
          idFilter.subjectId
        )
      );
      toast.success(`Delete success subject-class`);
      setIsModalOpen(false);
    },
  });

  const handleToAdd = () => {
    navigate("add-subject-class");
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
    deleteSubjectClassMutation.mutate();
  };

  // Filter
  const teachersQuery = useQuery(queryTeacher(1, 1000, "", "getFull"));
  const subjectsQuery = useQuery(querySubject(1, 1000, "", "getFull"));
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
        <h1>List Subject Class</h1>
      </div>
      <Button
        type="primary"
        style={{ margin: "10px 5px", fontWeight: "bold" }}
        onClick={handleToAdd}
      >
        Add Subject Class
      </Button>
      <div style={{ display:"flex", alignItems: "center", gap: "10px" }}>
        <h3>Filter: </h3>
        <Select
          showSearch
          mode="multiple"
          style={{minWidth: "200px"}}
          optionFilterProp="children"
          placeholder="Select Teacher"
          onChange={(e) => setIdFilter({ ...idFilter, teacherId: e })}
          filterOption={filterOption}
          options={teachersQuery.data?.teacherList.map((children) => ({
            value: children.id,
            label: `${children.firstName} ${children.lastName}`,
          }))}
        />
        <Select
          showSearch
          mode="multiple"
          style={{minWidth: "200px"}}
          optionFilterProp="children"
          placeholder="Select Subject"
          onChange={(e) => setIdFilter({ ...idFilter, subjectId: e })}
          filterOption={filterOption}
          options={subjectsQuery.data?.subjectList.map((children) => ({
            value: children.id,
            label: children.subjectName,
          }))}
        />
      </div>
      {subjectClassQuery.isLoading ? (
        <Skeleton active />
      ) : (
        <Table
          style={{ opacity: `${subjectClassQuery.isFetching ? "0.5" : "1"}` }}
          columns={columns({ handlecChangeModal, handleToEdit })}
          dataSource={subjectClassQuery.data?.listSubjectClass.map((item) => ({
            ...item,
            key: item.id,
          }))}
          pagination={{
            total: totalSubjectClassCount,
            pageSize: LIMIT,
            onChange: (newPage: number) => {
              setPage(newPage);
            },
          }}
        />
      )}

      <Modal
        title="Delete SubjectClass"
        open={isModalOpen}
        onOk={handleDelete}
        confirmLoading={deleteSubjectClassMutation.isPending}
        onCancel={() => handlecChangeModal()}
      >
        <p>Are you sure you want to delete this subject-class?</p>
      </Modal>
    </div>
  );
}
