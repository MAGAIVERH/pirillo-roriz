export type StudentListStatus =
  | 'LEAD'
  | 'TRIAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'FROZEN'
  | 'CANCELED'
  | 'DELINQUENT';

export type StudentListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  belt: string;
  age: number | null;
  status: StudentListStatus;
  joinDate: string;
  className: string;
};
