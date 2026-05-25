import type { components } from "@/shared/api/schema";
type Enrollment = components["schemas"]["EnrollmentRead"];
type CourseOffering = components["schemas"]["CourseOfferingRead"];
type CourseCatalog = components["schemas"]["CourseCatalogRead"];

export interface EnrollmentCardProps {
  enrollment: Enrollment;
  offering: CourseOffering;
  course: CourseCatalog;
}

export const EnrollmentCard = ({ enrollment, offering, course }: EnrollmentCardProps) => {
  return <div>Enrollment Card Stub</div>;
};
