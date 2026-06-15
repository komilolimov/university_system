import React from "react";
import { Circle, UserPlus, BookPlus, Building, Key } from "lucide-react";

export const RecentActivityFeed = () => {
  // In a real application, this would fetch from /api/v1/dashboard/stats/recent-activity
  const activities = [
    {
      id: 1,
      title: "New Student Enrollment",
      description: "Alice Johnson enrolled in CS101",
      time: "2 hours ago",
      icon: UserPlus,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: 2,
      title: "Course Updated",
      description: "Advanced Machine Learning syllabus updated",
      time: "5 hours ago",
      icon: BookPlus,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      id: 3,
      title: "Room Assignment",
      description: "Room 402 assigned to Engineering Dept.",
      time: "1 day ago",
      icon: Building,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      id: 4,
      title: "Permission Changed",
      description: "Admin granted 'roles:write' to HR Group",
      time: "2 days ago",
      icon: Key,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      id: 5,
      title: "New Student Enrollment",
      description: "Bob Smith enrolled in PHY201",
      time: "3 days ago",
      icon: UserPlus,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="bg-white border border-neutral-200/60 rounded-xl shadow-sm flex flex-col overflow-hidden select-none">
      <div className="p-6 border-b border-neutral-200/60 flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Recent Activity
        </h2>
        <p className="text-xs font-medium text-neutral-500">
          Latest system events
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {activities.map((activity, idx) => {
          const Icon = activity.icon;
          const isLast = idx === activities.length - 1;

          return (
            <div key={activity.id} className="relative flex gap-4">
              {!isLast && (
                <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-neutral-200" />
              )}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${activity.bg} shrink-0`}
              >
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex flex-col gap-1 pt-1.5">
                <span className="text-sm font-semibold text-neutral-900 leading-none">
                  {activity.title}
                </span>
                <span className="text-xs text-neutral-500">
                  {activity.description}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 mt-0.5">
                  {activity.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
