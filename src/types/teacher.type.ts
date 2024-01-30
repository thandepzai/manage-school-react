export interface TeacherType {
  yearStartTeaching: number;
  teachingStatus: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  email: string;
  id: string;
}

export interface GetListTeacherType {
  count: number;
  teacherList: TeacherType[];
}