import { StudentType } from "./student.type";
import { SubjectClassGetType } from "./subject-class.type";

export interface RegisterClassGetType {
  id: string;
  studentId: StudentType;
  subjectClassId: SubjectClassGetType;
  status: string;
}

export interface GetListRegisterClassType {
  count: number;
  registerClassList: RegisterClassGetType[]
}

export interface RegisterClassPostType {
  id: string;
  studentId: string;
  subjectClassId: string;
  status: string;
}