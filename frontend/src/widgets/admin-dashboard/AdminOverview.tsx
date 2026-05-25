export const AdminOverview = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-2xl font-bold border-b border-gray-900 pb-2 uppercase tracking-widest text-gray-900">
        Administrator Control Panel
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="border border-gray-200 p-6 flex flex-col gap-4 hover:border-gray-400 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Course Management</h3>
          <p className="text-sm font-medium tracking-wide text-gray-500 leading-relaxed">Create, edit, and schedule course offerings across the university.</p>
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <button className="w-full border border-gray-900 text-gray-900 font-bold py-3 uppercase tracking-wider hover:border-black hover:text-black transition-all">
              Manage Courses
            </button>
          </div>
        </div>
        <div className="border border-gray-200 p-6 flex flex-col gap-4 hover:border-gray-400 transition-colors">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Student Roster</h3>
          <p className="text-sm font-medium tracking-wide text-gray-500 leading-relaxed">Review student enrollments, modify grades, and audit accounts.</p>
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <button className="w-full border border-gray-900 text-gray-900 font-bold py-3 uppercase tracking-wider hover:border-black hover:text-black transition-all">
              View Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
