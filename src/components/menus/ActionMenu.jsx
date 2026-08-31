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

  const MENU_WIDTH = 160;
  const VIEWPORT_MARGIN = 8;

  const toggleMenu = () => {
    if (
      buttonRef.current
    ) {
      const rect =
        buttonRef.current.getBoundingClientRect();

      const desiredLeft =
        rect.right +
        window.scrollX -
        MENU_WIDTH;
      const maxLeft =
        window.scrollX +
        window.innerWidth -
        MENU_WIDTH -
        VIEWPORT_MARGIN;
      const minLeft =
        window.scrollX +
        VIEWPORT_MARGIN;

      setPosition({
        top:
          rect.bottom +
          window.scrollY +
          8,
        left: Math.min(
          Math.max(desiredLeft, minLeft),
          maxLeft
        ),
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
          p-2.5
          md:p-2
          rounded-lg
          bg-muted
          hover:bg-muted
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
              bg-background
              border
              border-transparent
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
                    hover:bg-muted
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