import { useState } from "react";
import { QuickActionButton } from "./QuickActionButton";
import { QUICK_ACTION_ITEMS } from "./quickActionItems";
import { HierarchySelectionModal } from "./HierarchySelectionModal";

export function QuickActions() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create-lesson" | "upload-content" | null>(null);

  const handleActionClick = (actionType?: "create-lesson" | "upload-content") => {
    if (actionType) {
      setModalType(actionType);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div
        role="toolbar"
        aria-label="Quick actions"
        className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1"
      >
        {QUICK_ACTION_ITEMS.map((item) => (
          <QuickActionButton
            key={item.label}
            {...item}
            onClick={() => handleActionClick(item.actionType)}
          />
        ))}
      </div>

      {modalType && (
        <HierarchySelectionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
        />
      )}
    </>
  );
}
