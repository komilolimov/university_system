# 1. chore(entities/enrollment): create directory structure
mkdir src\entities\enrollment\ui -Force
New-Item src\entities\enrollment\ui\.gitkeep -ItemType File -Force
git add src\entities\enrollment\ui\.gitkeep
git commit -m "chore(entities/enrollment): create directory structure"

# 2. feat(entities/enrollment): create EnrollmentCard component signature
$enrollmentCard1 = @"
import type { components } from `"@/shared/api/schema`";
type Enrollment = components[`"schemas`"][`"EnrollmentRead`"];
type CourseOffering = components[`"schemas`"][`"CourseOfferingRead`"];
type CourseCatalog = components[`"schemas`"][`"CourseCatalogRead`"];

export interface EnrollmentCardProps {
  enrollment: Enrollment;
  offering: CourseOffering;
  course: CourseCatalog;
}

export const EnrollmentCard = ({ enrollment, offering, course }: EnrollmentCardProps) => {
  return <div>Enrollment Card Stub</div>;
};
"@
Set-Content -Path src\entities\enrollment\EnrollmentCard.tsx -Value $enrollmentCard1 -Encoding UTF8
git add src\entities\enrollment\EnrollmentCard.tsx
git commit -m "feat(entities/enrollment): create EnrollmentCard component signature"

# 3. feat(entities/enrollment): design strict FSD layout for EnrollmentCard
$enrollmentCard2 = @"
import type { components } from `"@/shared/api/schema`";
type Enrollment = components[`"schemas`"][`"EnrollmentRead`"];
type CourseOffering = components[`"schemas`"][`"CourseOfferingRead`"];
type CourseCatalog = components[`"schemas`"][`"CourseCatalogRead`"];

export interface EnrollmentCardProps {
  enrollment: Enrollment;
  offering: CourseOffering;
  course: CourseCatalog;
}

export const EnrollmentCard = ({ enrollment, offering, course }: EnrollmentCardProps) => {
  return (
    <div className=`"border border-gray-200 p-6 flex flex-col gap-4 w-full transition-colors hover:border-gray-400`">
      <div className=`"flex flex-col gap-1 border-b border-gray-200 pb-4`">
        <h3 className=`"text-xl font-bold text-gray-900 tracking-tight`">{course.title}</h3>
        <p className=`"text-sm font-semibold tracking-widest uppercase text-gray-500`">{course.code} • {course.credits} Credits</p>
      </div>
      <div className=`"flex justify-between items-center pt-2`">
        <span className=`"text-xs font-bold uppercase tracking-widest text-gray-400`">Status</span>
        <span className=`"text-xs font-bold tracking-widest uppercase text-gray-900 border border-gray-900 px-3 py-1`">
          {enrollment.status}
        </span>
      </div>
      {offering.schedule_blocks && (
        <div className=`"flex flex-col gap-1 pt-2`">
          <span className=`"text-xs font-bold uppercase tracking-widest text-gray-400`">Schedule</span>
          <span className=`"text-sm font-medium text-gray-700`">{offering.schedule_blocks}</span>
        </div>
      )}
    </div>
  );
};
"@
Set-Content -Path src\entities\enrollment\EnrollmentCard.tsx -Value $enrollmentCard2 -Encoding UTF8
git add src\entities\enrollment\EnrollmentCard.tsx
git commit -m "feat(entities/enrollment): design strict FSD layout for EnrollmentCard"

# 4. feat(entities/enrollment): export EnrollmentCard from public API
$entitiesIndex = @"
export { EnrollmentCard } from `"./EnrollmentCard`";
"@
Set-Content -Path src\entities\enrollment\index.ts -Value $entitiesIndex -Encoding UTF8
git add src\entities\enrollment\index.ts
git commit -m "feat(entities/enrollment): export EnrollmentCard from public API"

# 5. chore(widgets/my-enrollments): create directory structure
mkdir src\widgets\my-enrollments\ui -Force
New-Item src\widgets\my-enrollments\ui\.gitkeep -ItemType File -Force
git add src\widgets\my-enrollments\ui\.gitkeep
git commit -m "chore(widgets/my-enrollments): create directory structure"

# 6. feat(widgets/my-enrollments): create EnrollmentList skeleton and base fetching
$enrollmentList1 = @"
import { apiClient } from `"@/shared/api/client`";
import { getJwtPayload } from `"@/shared/auth/jwt`";

export const EnrollmentList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const studentId = Number(payload.sub);
  const { data: enrollments } = await apiClient.GET(`"/api/v1/enrollments/`", {
    params: { query: { student_id: studentId } }
  });

  return <div>List goes here</div>;
};
"@
Set-Content -Path src\widgets\my-enrollments\EnrollmentList.tsx -Value $enrollmentList1 -Encoding UTF8
git add src\widgets\my-enrollments\EnrollmentList.tsx
git commit -m "feat(widgets/my-enrollments): create EnrollmentList skeleton and base fetching"

# 7. feat(widgets/my-enrollments): implement related offering and catalog resolution
$enrollmentList2 = @"
import { apiClient } from `"@/shared/api/client`";
import { getJwtPayload } from `"@/shared/auth/jwt`";
import { EnrollmentCard } from `"@/entities/enrollment`";

export const EnrollmentList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const studentId = Number(payload.sub);
  const { data: enrollments } = await apiClient.GET(`"/api/v1/enrollments/`", {
    params: { query: { student_id: studentId } }
  });

  if (!enrollments || enrollments.length === 0) return <div>No enrollments</div>;

  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enr) => {
      const { data: offering } = await apiClient.GET(`"/api/v1/course-offerings/{offering_id}`", {
        params: { path: { offering_id: enr.offering_id } }
      });
      let course = null;
      if (offering?.catalog_id) {
        const { data: c } = await apiClient.GET(`"/api/v1/course-catalog/{catalog_id}`", {
          params: { path: { catalog_id: offering.catalog_id } }
        });
        course = c;
      }
      return { enrollment: enr, offering, course };
    })
  );

  return (
    <div>
      {enrichedEnrollments.map(({ enrollment, offering, course }) => 
        (offering && course) ? (
          <EnrollmentCard key={enrollment.offering_id} enrollment={enrollment} offering={offering} course={course} />
        ) : null
      )}
    </div>
  );
};
"@
Set-Content -Path src\widgets\my-enrollments\EnrollmentList.tsx -Value $enrollmentList2 -Encoding UTF8
git add src\widgets\my-enrollments\EnrollmentList.tsx
git commit -m "feat(widgets/my-enrollments): implement related offering and catalog resolution"

# 8. feat(widgets/my-enrollments): handle empty states and layout
$enrollmentList3 = @"
import { apiClient } from `"@/shared/api/client`";
import { getJwtPayload } from `"@/shared/auth/jwt`";
import { EnrollmentCard } from `"@/entities/enrollment`";

export const EnrollmentList = async () => {
  const payload = await getJwtPayload();
  if (!payload || !payload.sub) return null;

  const studentId = Number(payload.sub);
  const { data: enrollments } = await apiClient.GET(`"/api/v1/enrollments/`", {
    params: { query: { student_id: studentId } }
  });

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className=`"flex flex-col gap-6 w-full`">
        <h2 className=`"text-2xl font-bold border-b border-gray-900 pb-2 uppercase tracking-widest text-gray-900`">
          My Enrollments
        </h2>
        <div className=`"border border-gray-200 p-8 flex flex-col gap-2 items-center justify-center min-h-[200px]`">
          <h3 className=`"text-xl font-bold text-gray-900`">No active enrollments</h3>
          <p className=`"text-gray-500 font-medium tracking-wide`">You are not enrolled in any courses yet.</p>
        </div>
      </div>
    );
  }

  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (enr) => {
      const { data: offering } = await apiClient.GET(`"/api/v1/course-offerings/{offering_id}`", {
        params: { path: { offering_id: enr.offering_id } }
      });
      let course = null;
      if (offering?.catalog_id) {
        const { data: c } = await apiClient.GET(`"/api/v1/course-catalog/{catalog_id}`", {
          params: { path: { catalog_id: offering.catalog_id } }
        });
        course = c;
      }
      return { enrollment: enr, offering, course };
    })
  );

  return (
    <div className=`"flex flex-col gap-6 w-full`">
      <h2 className=`"text-2xl font-bold border-b border-gray-900 pb-2 uppercase tracking-widest text-gray-900`">
        My Enrollments
      </h2>
      <div className=`"grid grid-cols-1 xl:grid-cols-2 gap-6`">
        {enrichedEnrollments.map(({ enrollment, offering, course }) => 
          (offering && course) ? (
            <EnrollmentCard key={enrollment.offering_id} enrollment={enrollment} offering={offering} course={course} />
          ) : null
        )}
      </div>
    </div>
  );
};
"@
Set-Content -Path src\widgets\my-enrollments\EnrollmentList.tsx -Value $enrollmentList3 -Encoding UTF8
git add src\widgets\my-enrollments\EnrollmentList.tsx
git commit -m "feat(widgets/my-enrollments): handle empty states and layout"

# 9. feat(widgets/my-enrollments): export EnrollmentList from public API
$widgetIndex = @"
export { EnrollmentList } from `"./EnrollmentList`";
"@
Set-Content -Path src\widgets\my-enrollments\index.ts -Value $widgetIndex -Encoding UTF8
git add src\widgets\my-enrollments\index.ts
git commit -m "feat(widgets/my-enrollments): export EnrollmentList from public API"

# 10. feat(app/dashboard): integrate EnrollmentList into dashboard layout
$dashboardPage = @"
import { LogoutButton } from `"@/features/auth/logout`";
import { StudentProfileOverview } from `"@/widgets/student-profile`";
import { EnrollmentList } from `"@/widgets/my-enrollments`";

export default function DashboardPage() {
  return (
    <main className=`"fsd-container mx-auto my-16 max-w-6xl flex flex-col gap-8 px-4`">
      <header className=`"flex justify-between items-end border-b border-gray-200 pb-4`">
        <div className=`"flex flex-col gap-1`">
          <h1 className=`"text-4xl font-bold tracking-tight text-gray-900`">Student Dashboard</h1>
          <p className=`"text-gray-500 font-medium`">Welcome to your university portal.</p>
        </div>
        <LogoutButton />
      </header>
      <div className=`"grid grid-cols-1 md:grid-cols-3 gap-8`">
        <aside className=`"md:col-span-1`">
          <StudentProfileOverview />
        </aside>
        <section className=`"md:col-span-2`">
          <EnrollmentList />
        </section>
      </div>
    </main>
  );
}
"@
Set-Content -Path src\app\dashboard\page.tsx -Value $dashboardPage -Encoding UTF8
git add src\app\dashboard\page.tsx
git commit -m "feat(app/dashboard): integrate EnrollmentList into dashboard layout"
