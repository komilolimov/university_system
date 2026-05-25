import type { components } from "@/shared/api/schema";

type Student = components["schemas"]["StudentRead"];

interface StudentProfileCardProps {
  student: Student;
}

export const StudentProfileCard = ({ student }: StudentProfileCardProps) => {
  return (
    <div className="border border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {student.first_name} {student.last_name}
        </h2>
        <p className="text-gray-500 font-medium">{student.email}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Region</span>
          <span className="text-gray-900 font-medium">{student.region}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Enrollment Date</span>
          <span className="text-gray-900 font-medium">{student.enrollment_date}</span>
        </div>
        {student.advisor_id && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Advisor ID</span>
            <span className="text-gray-900 font-medium">{student.advisor_id}</span>
          </div>
        )}
      </div>
    </div>
  );
};
