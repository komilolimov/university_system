import { Metadata } from "next";
import { EmployeesDataGrid } from "@/widgets/employee";

export const metadata: Metadata = {
  title: "Staff & Advisors | University System",
  description: "Manage university employees, faculty, and academic advisors.",
};

export default function EmployeesPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      {/* Заголовок страницы */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Staff & Advisors
        </h1>
        <p className="text-sm text-neutral-500">
          Manage university personnel, assign roles, and configure departmental access.
        </p>
      </div>

      {/* Контейнер для виджета (таблицы) */}
      <div className="flex-1 min-h-[600px] w-full">
        {/* Здесь мы передаем проп canMutate=true, как договаривались для FSD */}
        <EmployeesDataGrid canMutate={true} />
      </div>
    </main>
  );
}