
export enum ProjectStatus {
  PLANNING = 'อยู่ในแผน',
  NOT_STARTED = 'ยังไม่เริ่ม',
  IN_PROGRESS = 'กำลังก่อสร้าง',
  COMPLETED = 'แล้วเสร็จ',
  CANCELLED = 'ยกเลิก',
  DELAYED = 'ล่าช้า'
}

export enum PlanStatus {
  ACTIVE = 'อยู่ในแผน',
  REMOVED = 'ตัดออก',
  POSTPONED = 'เลื่อน'
}

export enum PriorityLevel {
  HIGH = 'สูง',
  MEDIUM = 'กลาง',
  LOW = 'ต่ำ'
}

export enum ProjectCategory {
  ROAD = 'ถนน',
  DRAINAGE = 'ระบายน้ำ',
  BUILDING = 'อาคาร',
  ELECTRICITY = 'ไฟฟ้า',
  WATER = 'ประปา',
  OTHER = 'อื่น ๆ'
}

export enum AssetCondition {
  GOOD = 'ดี',
  FAIR = 'ปานกลาง',
  POOR = 'ชำรุด'
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  cost: number;
}

export interface Project {
  id: string;
  projectCode: string;
  fiscalYear: string;
  name: string;
  category: ProjectCategory;
  planId: string;
  area: string;
  lat: number;
  lng: number;
  budgetEstimated: number;
  budgetActual: number;
  budgetSource: string;
  contractor: string;
  contractDateStart: string;
  contractDateEnd: string;
  durationDays: number;
  progressPercent: number;
  status: ProjectStatus;
  engineer: string;
  description: string;
  problems: string;
  photos?: {
    before?: string;
    after?: string;
  };
  citizenFeedback?: {
    count: number;
    lastReport?: string;
  };
  maintenanceLogs?: MaintenanceLog[];
}

export interface DevelopmentPlan {
  id: string;
  planId: string;
  planType: '3 ปี' | '5 ปี';
  fiscalYearRange: string;
  name: string;
  category: ProjectCategory;
  area: string;
  estimatedBudget: number;
  priority: PriorityLevel;
  department: string;
  status: PlanStatus;
}

export interface Asset {
  id: string;
  category: ProjectCategory;
  constructionYear: string;
  expectedLifeYears: number;
  lastChecked: string;
  condition: AssetCondition;
  maintenanceBudget: number;
  maintenanceHistory: string[];
}

export enum UserRole {
  ADMIN = 'Admin',
  ENGINEER = 'กองช่าง',
  EXECUTIVE = 'ผู้บริหาร',
  FINANCE = 'เจ้าหน้าที่การเงิน',
  CITIZEN = 'ประชาชน'
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  department: string;
  email: string;
  lastLogin?: string;
}
