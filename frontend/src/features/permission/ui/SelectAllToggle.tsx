"use client";

interface SelectAllToggleProps {
  isAllSelected: boolean;
  onToggleAll: () => void;
  disabled?: boolean;
}

export const SelectAllToggle = ({
  isAllSelected,
  onToggleAll,
  disabled = false,
}: SelectAllToggleProps) => {
  return (
    <button
      onClick={onToggleAll}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm flex items-center gap-2 border ${
        isAllSelected
          ? "bg-black text-white border-black hover:bg-neutral-900"
          : "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          isAllSelected
            ? "bg-white border-white text-black"
            : "bg-transparent border-neutral-300 text-transparent"
        }`}
      >
        <span className="text-[10px] font-bold leading-none">✓</span>
      </div>
      {isAllSelected ? "Revoke All Permissions" : "Grant All Permissions"}
    </button>
  );
};
