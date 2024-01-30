export interface SchoolType {
  id: string;
  schoolName: string;
  address: string;
  email: string;
  hotline: string;
  dateEstablished: number;
  typeOfEducation: number;
  description: string;
}

export interface GetListSchoolType {
  count: number;
  schoolList: SchoolType[];
}