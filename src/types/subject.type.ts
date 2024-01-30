export interface SubjectType {
  id: string;
  subjectName: string;
  level: number;
  creditHour: number;
}

export interface GetListSubjectType {
  count: number;
  subjectList: SubjectType[];
}