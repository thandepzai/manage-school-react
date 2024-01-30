export interface StudentType {
  id: string;
  level: number;
  enrollmentStatus: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
}

export interface GetListStudentType {
  count: number;
  studentList: StudentType[];
}