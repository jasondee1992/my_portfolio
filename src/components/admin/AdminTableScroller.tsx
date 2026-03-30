"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";

type AdminTableScrollerProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminTableScroller({
  children,
  className = "",
}: AdminTableScrollerProps) {
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollInnerRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef<"top" | "bottom" | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function syncMetrics() {
    const topScroll = topScrollRef.current;
    const topScrollInner = topScrollInnerRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (!topScroll || !topScrollInner || !bottomScroll) {
      return;
    }

    topScrollInner.style.width = `${bottomScroll.scrollWidth}px`;

    const hasHorizontalOverflow = bottomScroll.scrollWidth > bottomScroll.clientWidth + 1;
    const maxScrollLeft = Math.max(bottomScroll.scrollWidth - bottomScroll.clientWidth, 0);

    setCanScroll(hasHorizontalOverflow);
    setCanScrollLeft(bottomScroll.scrollLeft > 1);
    setCanScrollRight(bottomScroll.scrollLeft < maxScrollLeft - 1);

    if (syncingRef.current !== "top" && Math.abs(topScroll.scrollLeft - bottomScroll.scrollLeft) > 1) {
      topScroll.scrollLeft = bottomScroll.scrollLeft;
    }
  }

  useLayoutEffect(() => {
    syncMetrics();
  });

  useEffect(() => {
    const bottomScroll = bottomScrollRef.current;

    if (!bottomScroll || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      syncMetrics();
    });

    resizeObserver.observe(bottomScroll);

    const table = bottomScroll.querySelector("table");
    if (table) {
      resizeObserver.observe(table);
    }

    window.addEventListener("resize", syncMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncMetrics);
    };
  }, []);

  function handleTopScroll(event: UIEvent<HTMLDivElement>) {
    const bottomScroll = bottomScrollRef.current;

    if (!bottomScroll || syncingRef.current === "bottom") {
      return;
    }

    syncingRef.current = "top";
    bottomScroll.scrollLeft = event.currentTarget.scrollLeft;
    syncMetrics();
    syncingRef.current = null;
  }

  function handleBottomScroll(event: UIEvent<HTMLDivElement>) {
    const topScroll = topScrollRef.current;

    if (!topScroll || syncingRef.current === "top") {
      syncMetrics();
      return;
    }

    syncingRef.current = "bottom";
    topScroll.scrollLeft = event.currentTarget.scrollLeft;
    syncMetrics();
    syncingRef.current = null;
  }

  function scrollByAmount(direction: "left" | "right") {
    const bottomScroll = bottomScrollRef.current;

    if (!bottomScroll) {
      return;
    }

    const amount = Math.max(bottomScroll.clientWidth * 0.7, 260);
    bottomScroll.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className={className}>
      <div className="admin-grid-scrollbar-bar">
        <div className="admin-grid-scrollbar-copy">Scroll table horizontally</div>
        <div className="admin-grid-scrollbar-actions">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            disabled={!canScroll || !canScrollLeft}
            className="admin-grid-scrollbar-button"
            aria-label="Scroll table left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            disabled={!canScroll || !canScrollRight}
            className="admin-grid-scrollbar-button"
            aria-label="Scroll table right"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className={`admin-grid-top-scroll ${canScroll ? "" : "admin-grid-top-scroll-hidden"}`}
      >
        <div ref={topScrollInnerRef} className="admin-grid-top-scroll-inner" />
      </div>

      <div ref={bottomScrollRef} onScroll={handleBottomScroll} className="admin-grid-table-wrap">
        {children}
      </div>
    </div>
  );
}
