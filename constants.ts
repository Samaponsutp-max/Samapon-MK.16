
import { Project, ProjectStatus, ProjectCategory, Asset, AssetCondition, UserAccount, UserRole, DevelopmentPlan, PriorityLevel, PlanStatus } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    projectCode: '67-RD-001',
    fiscalYear: '2567',
    name: 'ปรับปรุงถนนคอนกรีตเสริมเหล็ก หมู่ที่ 3',
    category: ProjectCategory.ROAD,
    planId: 'PLAN-A-01',
    area: 'หมู่ 3 ต.สมมติ',
    lat: 13.7563,
    lng: 100.5018,
    budgetEstimated: 1500000,
    budgetActual: 1450000,
    budgetSource: 'งบปกติ',
    contractor: 'บริษัท ทางดี จำกัด',
    contractDateStart: '2024-01-10',
    contractDateEnd: '2024-05-10',
    durationDays: 120,
    progressPercent: 100,
    status: ProjectStatus.COMPLETED,
    engineer: 'นายช่างสมชาย',
    description: 'งานลาดยางและปรับปรุงไหล่ทาง',
    problems: '-'
  },
  {
    id: '2',
    projectCode: '67-DR-002',
    fiscalYear: '2567',
    name: 'ขยายท่อระบายน้ำชุมชนริมคลอง',
    category: ProjectCategory.DRAINAGE,
    planId: 'PLAN-B-05',
    area: 'เขตเทศบาล',
    lat: 13.7500,
    lng: 100.5200,
    budgetEstimated: 800000,
    budgetActual: 800000,
    budgetSource: 'เงินอุดหนุน',
    contractor: 'รับเหมางานโยธา',
    contractDateStart: '2024-03-01',
    contractDateEnd: '2024-06-30',
    durationDays: 120,
    progressPercent: 45,
    status: ProjectStatus.IN_PROGRESS,
    engineer: 'นายช่างวิรัตน์',
    description: 'วางท่อระบายน้ำขนาด 1 เมตร',
    problems: 'ฝนตกหนักทำให้การขุดลอกทำได้ยาก'
  }
];

export const MOCK_DEVELOPMENT_PLANS: DevelopmentPlan[] = [
  {
    id: 'dp-1',
    planId: 'PLAN-67-001',
    planType: '5 ปี',
    fiscalYearRange: '2566-2570',
    name: 'โครงการก่อสร้างอาคารศูนย์พัฒนาเด็กเล็ก',
    category: ProjectCategory.BUILDING,
    area: 'หมู่ 5',
    estimatedBudget: 4500000,
    priority: PriorityLevel.HIGH,
    department: 'กองการศึกษา',
    status: PlanStatus.ACTIVE
  },
  {
    id: 'dp-2',
    planId: 'PLAN-67-002',
    planType: '3 ปี',
    fiscalYearRange: '2567-2569',
    name: 'ขยายเขตไฟฟ้าสาธารณะซอยร่วมใจ',
    category: ProjectCategory.ELECTRICITY,
    area: 'เขตชุมชนเมือง',
    estimatedBudget: 1200000,
    priority: PriorityLevel.MEDIUM,
    department: 'กองช่าง',
    status: PlanStatus.ACTIVE
  },
  {
    id: 'dp-3',
    planId: 'PLAN-67-003',
    planType: '5 ปี',
    fiscalYearRange: '2566-2570',
    name: 'ปรับปรุงภูมิทัศน์สวนสาธารณะเฉลิมพระเกียรติ',
    category: ProjectCategory.OTHER,
    area: 'ริมหนองน้ำ',
    estimatedBudget: 800000,
    priority: PriorityLevel.LOW,
    department: 'กองช่าง',
    status: PlanStatus.POSTPONED
  }
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'AST-2560-RD-01',
    category: ProjectCategory.ROAD,
    constructionYear: '2560',
    expectedLifeYears: 10,
    lastChecked: '2024-01-15',
    condition: AssetCondition.FAIR,
    maintenanceBudget: 150000,
    history: ['ซ่อมผิวทาง 2563', 'ล้างท่อข้างทาง 2565']
  },
  {
    id: 'AST-2555-BLD-04',
    category: ProjectCategory.BUILDING,
    constructionYear: '2555',
    expectedLifeYears: 30,
    lastChecked: '2024-03-20',
    condition: AssetCondition.POOR,
    maintenanceBudget: 850000,
    history: ['ทาสีใหม่ 2560', 'ซ่อมระบบไฟ 2564']
  },
  {
    id: 'AST-2565-WAT-12',
    category: ProjectCategory.WATER,
    constructionYear: '2565',
    expectedLifeYears: 20,
    lastChecked: '2024-05-10',
    condition: AssetCondition.GOOD,
    maintenanceBudget: 25000,
    history: ['ติดตั้งมิเตอร์อัจฉริยะ 2566']
  },
  {
    id: 'AST-2562-ELE-09',
    category: ProjectCategory.ELECTRICITY,
    constructionYear: '2562',
    expectedLifeYears: 15,
    lastChecked: '2024-02-28',
    condition: AssetCondition.GOOD,
    maintenanceBudget: 120000,
    history: ['เปลี่ยนหลอด LED ทั้งสาย 2564']
  },
  {
    id: 'AST-2558-DRN-02',
    category: ProjectCategory.DRAINAGE,
    constructionYear: '2558',
    expectedLifeYears: 25,
    lastChecked: '2024-04-12',
    condition: AssetCondition.FAIR,
    maintenanceBudget: 420000,
    history: ['ขุดลอกตะกอน 2562', 'ขุดลอกตะกอน 2566']
  }
];

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'U001',
    name: 'สมชาย รักงาน',
    username: 'admin_somchai',
    role: UserRole.ADMIN,
    department: 'กองกลาง',
    email: 'somchai@localgov.go.th',
    lastLogin: '2024-05-20 09:30'
  }
];
