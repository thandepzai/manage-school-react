import { SubjectType } from "./subject.type";
import { TeacherType } from "./teacher.type";

export interface SubjectClassPostType {
  id:string;
  teacherId: string;
  subjectId: string;
  maxQuantity: number;
  minQuantity: number;
  startAt: Date;
  endAt: Date;
  classRoom: string;
  academicYear: number;
  classStatus: string;
}

export interface SubjectClassGetType {
  id: string;
  teacherId: TeacherType;
  subjectId: SubjectType;
  maxQuantity: number;
  minQuantity: number;
  startAt: Date;
  endAt: Date;
  classRoom: string;
  academicYear: number;
  classStatus: string;
}

export interface GetListSubjectClassType {
  count: number;
  listSubjectClass: SubjectClassGetType[]
}