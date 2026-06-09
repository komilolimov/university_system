import { Metadata } from "next";
import { RoomsDataGrid } from "@/widgets/rooms";

export const metadata: Metadata = {
  title: "Rooms | University System",
  description: "Manage campus rooms, lecture halls, and facility capacities.",
};

export default function RoomsPage() {
  return (
    <main className="flex-1 flex flex-col h-full p-6 lg:p-8">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <div className="border-l-4 border-neutral-900 pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Rooms
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Manage individual rooms, assign room types, and monitor seating capacities for academic scheduling.
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] w-full">
        <RoomsDataGrid canMutate={true} />
      </div>
    </main>
  );
}