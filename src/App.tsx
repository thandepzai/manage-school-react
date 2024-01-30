import { useRoutes } from "react-router-dom";
import Main from "./layout";
import SchoolManage from "./pages/manage/school-manage";
import StudentManage from "./pages/manage/student-manage";
import TeacherManage from "./pages/manage/teacher-manage";
import SubjectManage from "./pages/manage/subject-manage";
import NotFound from "./pages/NotFound";
import SchoolAdd from "./pages/add/school-add";
import SubjectClassManage from "./pages/manage/subject-class-manage";
import TeacherAdd from "./pages/add/teacher-add";
import StudentAdd from "./pages/add/student-add";
import SubjectAdd from "./pages/add/subject-add";
import RegisterClassManage from "./pages/manage/register-class-manage";
import SubjectClassAdd from "./pages/add/subject-class-add";
import RegisterClassAdd from "./pages/add/register-class-add";

function App() {
  const elements = useRoutes([
    {
      path: "/",
      element: <>Welcome home</>,
    },
    {
      path: "/school-manage",
      element: <SchoolManage />,
    },
    {
      path: "/student-manage",
      element: <StudentManage />,
    },
    {
      path: "/teacher-manage",
      element: <TeacherManage />,
    },
    {
      path: "/subject-manage",
      element: <SubjectManage />,
    },
    {
      path: "/subject-class-manage",
      element: <SubjectClassManage />,
    },
    {
      path: "/register-class-manage",
      element: <RegisterClassManage />,
    },
    {
      path: "/school-manage/*",
      element: <SchoolAdd />,
    },
    {
      path: "/teacher-manage/*",
      element: <TeacherAdd />,
    },
    {
      path: "/student-manage/*",
      element: <StudentAdd />,
    },
    {
      path: "/subject-manage/*",
      element: <SubjectAdd />,
    },
    {
      path: "/subject-class-manage/*",
      element: <SubjectClassAdd />,
    },
    {
      path: "/register-class-manage/*",
      element: <RegisterClassAdd />,
    },
    {
      path: '*',
      element: <NotFound />
    }
  ]);
  return (
    <div className="App">
      <Main>{elements}</Main>
    </div>
  )
}

export default App
