import type { AwardLevel, Department, Program } from '@/data/types'

export interface DepartmentGroup {
  department: Department
  programs: Program[]
}

export function groupByDepartment(departments: Department[], programs: Program[], award: AwardLevel): DepartmentGroup[] {
  return departments
    .map((department) => ({
      department,
      programs: programs.filter((p) => p.departmentId === department.id && p.awardLevel === award),
    }))
    .filter((group) => group.programs.length > 0)
}
