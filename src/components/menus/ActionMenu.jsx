"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import { createPortal } from "react-dom";

import {
  FaEllipsisV,
} from "react-icons/fa";

export default function ActionMenu({
  items,
}) {
  const [open, setOpen] =
    useState(false);

  const [position, setPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const buttonRef =
    useRef(null);

  const menuRef =
    useRef(null);

  useEffect(() => {
    const closeMenu = (
      event
    ) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(
          event.target
        ) &&
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "click",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "click",
        closeMenu
      );
    };
  }, []);

  const toggleMenu = () => {
    if (
      buttonRef.current
    ) {
      const rect =
        buttonRef.current.getBoundingClientRect();

      setPosition({
        top:
          rect.bottom +
          window.scrollY +
          8,
        left:
          rect.right +
          window.scrollX -
          160,
      });
    }

    setOpen(
      (prev) => !prev
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="
          p-2
          rounded-lg
          bg-slate-800
          hover:bg-slate-700
          transition
        "
      >
        <FaEllipsisV />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position:
                "absolute",
              top:
                position.top,
              left:
                position.left,
            }}
            className="
              w-40
              bg-slate-900
              border
              border-slate-700
              rounded-lg
              shadow-xl
              z-[9999]
              overflow-hidden
            "
          >
            {items.map(
              (
                item,
                index
              ) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();

                    item.onClick?.();

                    setOpen(
                      false
                    );
                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    hover:bg-slate-800
                    transition
                  "
                >
                  {item.label}
                </button>
              )
            )}
          </div>,
          document.body
        )}
    </>
  );
}