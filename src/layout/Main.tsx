import React, { useState } from "react";
import { SiSololearn } from "react-icons/si";
import { FaSchool } from "react-icons/fa6";
import { PiStudentBold, PiChalkboardTeacherFill } from "react-icons/pi";
import { SiGoogleclassroom } from "react-icons/si";
import { FaBook } from "react-icons/fa";
import { GiArchiveRegister } from "react-icons/gi";

import { Link, NavLink, useLocation } from "react-router-dom";

import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(
    <NavLink to="/school-manage" style={{ fontWeight: "bold" }}>
      School Manage
    </NavLink>,
    "1",
    <FaSchool />
  ),
  getItem(
    <NavLink to="/teacher-manage" style={{ fontWeight: "bold" }}>
      Teacher Manage
    </NavLink>,
    "2",
    <PiChalkboardTeacherFill />
  ),
  getItem(
    <NavLink to="/student-manage" style={{ fontWeight: "bold" }}>
      Student Manage
    </NavLink>,
    "3",
    <PiStudentBold />
  ),
  getItem(
    <NavLink to="/subject-manage" style={{ fontWeight: "bold" }}>
      Subject Manage
    </NavLink>,
    "4",
    <FaBook />
  ),
  getItem(
    <NavLink to="/subject-class-manage" style={{ fontWeight: "bold" }}>
      Subject Class Manage
    </NavLink>,
    "5",
    <SiGoogleclassroom />
  ),
  getItem(
    <NavLink to="/register-class-manage" style={{ fontWeight: "bold" }}>
      Register Class Manage
    </NavLink>,
    "6",
    <GiArchiveRegister />
  ),
];

interface layoutInterface {
  children: React.ReactNode;
}

const getDefaultSelectKey = (pathname: string) => {
  switch (true) {
    case pathname.includes("school-manage"):
      return "1";
    case pathname.includes("teacher-manage"):
      return "2";
    case pathname.includes("student-manage"):
      return "3";
    case pathname.includes("subject-manage"):
      return "4";
    case pathname.includes("subject-class-manage"):
      return "5";
    case pathname.includes("register-class-manage"):
      return "6";
    default:
      return "1";
  }
};

export default function Main({ children }: layoutInterface) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  let { pathname } = useLocation();
  const listPage = pathname.split("/");

  let linkPage = "";
  const itemNamePage = listPage.map((item, key) => {
    if (key !== 0) {
      linkPage = linkPage + "/" + item;
      return {
        title: <Link to={linkPage}>{item}</Link>,
      };
    }
    return {
      title: "",
    };
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            margin: "20px 0px",
            justifyContent: "space-evenly",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          <SiSololearn />
          {!collapsed && "Admin School"}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[getDefaultSelectKey(pathname)]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <div
          style={{
            background: colorBgContainer,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            padding: "16px",
          }}
        >
          <Breadcrumb items={itemNamePage} />
        </div>
        <Content
          style={{
            margin: "16px",
            height: "100%",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
