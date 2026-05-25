import { CourseList } from "@/widgets/course-list";

export default function CoursesPage() {
  return (
    <main className="fsd-container mx-auto my-8 max-w-4xl flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">University Course Catalog</h1>
        <p className="text-gray-500 font-medium">Browse and discover all available degree courses.</p>
      </header>
      <section>
        <CourseList />
      </section>
    </main>
  );
}
