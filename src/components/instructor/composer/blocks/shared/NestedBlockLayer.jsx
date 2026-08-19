"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import AddBlockModal from "@/components/instructor/composer/AddBlockModal";
import { blockRegistry } from "@/components/instructor/composer/blocks/blockRegistry";
import ChildBlockBox from "./ChildBlockBox";
import NestedChildEditModal from "./NestedChildEditModal";
import MediaCropTool from "./MediaCropTool";
import { CROPPABLE_TYPES, createChildBlock, getCroppedMediaStyle } from "./nestedBlockUtils";

/**
 * Absolutely-positioned overlay for nesting a child block (video/image/audio/
 * text/…) inside another block's rendered preview — e.g. a video embedded
 * inside a Text block, drag-positioned and resized over the rendered
 * markdown. Must be rendered inside a `position: relative` container sized
 * to the parent block's preview. Children live in `block.children` inside
 * the parent block's own JSON data — see nestedBlockUtils.
 *
 * Adding a child is triggered externally (from the block's "⋮" menu →
 * "Add Block Inside") via the imperative `openPicker()` handle rather than
 * an on-canvas button, matching the rest of the composer's block-menu UX.
 *
 * `filterChildren`/`extraChildFields` let a parent (e.g. Slideshow) scope
 * children to a subset (a single slide) while still patching against the
 * full `block.children` array so other slides' children aren't lost.
 */
const NestedBlockLayer = forwardRef(function NestedBlockLayer(
  { block, onChange, editable, filterChildren, extraChildFields },
  ref,
) {
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [croppingChildId, setCroppingChildId] = useState(null);

  useImperativeHandle(ref, () => ({
    openPicker: () => setPickerOpen(true),
  }));

  const allChildren = block.children || [];
  const children = filterChildren ? allChildren.filter(filterChildren) : allChildren;

  const patchAllChildren = (nextAll) => onChange({ children: nextAll });

  const patchChild = (childId, patch) => {
    patchAllChildren(allChildren.map((c) => (c.id === childId ? { ...c, ...patch } : c)));
  };

  const removeChild = (childId) => {
    patchAllChildren(allChildren.filter((c) => c.id !== childId));
  };

  const handlePick = (blockType) => {
    const child = createChildBlock(blockType, blockRegistry, extraChildFields);
    patchAllChildren([...allChildren, child]);
    setPickerOpen(false);
  };

  const editingChild = children.find((c) => c.id === editingChildId) || null;
  const croppingChild = children.find((c) => c.id === croppingChildId) || null;

  if (!editable) {
    if (children.length === 0) return null;
    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        {children.map((child) => {
          const entry = blockRegistry[child.blockType];
          const ViewComponent = entry.ViewComponent;
          const position = child.position || { x: 8, y: 8 };
          const size = child.size || { w: 36, h: 28 };
          const cropped = CROPPABLE_TYPES.has(child.blockType) && child.url;

          return (
            <div
              key={child.id}
              className="absolute pointer-events-auto overflow-hidden rounded-md"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${size.w}%`,
                height: `${size.h}%`,
              }}
            >
              {cropped ? (
                (() => {
                  const { wrapper, inner } = getCroppedMediaStyle(child.crop);
                  return (
                    <div style={wrapper}>
                      {child.blockType === "video" ? (
                        <video src={child.url} style={inner} controls />
                      ) : (
                        <img src={child.url} alt={child.title || ""} style={inner} />
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="w-full h-full overflow-auto text-[11px] bg-slate-900/70 rounded-md p-1.5">
                  <ViewComponent block={child} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {children.map((child) => (
        <ChildBlockBox
          key={child.id}
          child={child}
          containerRef={containerRef}
          onMove={(position) => patchChild(child.id, { position })}
          onResize={(size) => patchChild(child.id, { size })}
          onEdit={() => setEditingChildId(child.id)}
          onCrop={() => setCroppingChildId(child.id)}
          onDelete={() => removeChild(child.id)}
          onUrlChange={(url) => patchChild(child.id, { url })}
        />
      ))}

      <AddBlockModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handlePick} />

      <NestedChildEditModal
        open={Boolean(editingChild)}
        onClose={() => setEditingChildId(null)}
        child={editingChild}
        onSave={(draft) => patchChild(draft.id, draft)}
      />

      <MediaCropTool
        open={Boolean(croppingChild)}
        onClose={() => setCroppingChildId(null)}
        child={croppingChild}
        onApply={(crop) => patchChild(croppingChild.id, { crop })}
      />
    </div>
  );
});

export default NestedBlockLayer;
