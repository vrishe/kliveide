import * as React from "react";
import { CSSProperties, useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import FloatingScrollbar, { ScrollbarApi } from "./FloatingScrollbar";
import { handleScrollKeys } from "./utils";

/**
 * The function that renders a virtual list item
 */
type ItemRenderer = (index: number, style: CSSProperties) => JSX.Element;

/**
 * The properties of the virtual list
 */
export type VirtualizedListProps = {
  numItems: number;
  itemHeight: number;
  focusable?: boolean;
  integralPosition?: boolean;
  renderItem: ItemRenderer;
  registerApi?: (api: VirtualizedListApi) => void;
};

/**
 * Represents the API the hosts of a virtual list can invoke
 */
export type VirtualizedListApi = {
  forceRefresh: () => void;
  scrollToItemByIndex: (index: number) => void;
  scrollToTop: () => void;
  scrollToEnd: () => void;
  getViewPort: () => { startIndex: number; endIndex: number };
};

/**
 * This function represents a virtual list
 */
export default function VirtualizedList({
  numItems,
  itemHeight = 20,
  focusable = true,
  integralPosition = true,
  renderItem,
  registerApi,
}: VirtualizedListProps) {
  // --- Status flags for the initialization cycle
  const mounted = useRef(false);
  const initialized = useRef(false);

  // --- Store the API to control the vertical scrollbar
  const verticalApi = useRef<ScrollbarApi>();
  const horizontalApi = useRef<ScrollbarApi>();

  // --- Temporary store fro scroll position on refresh
  const tmpScrollPos = useRef(-1);

  // --- Component state
  const [items, setItems] = useState<React.ReactNode[]>();
  const [pointed, setPointed] = useState(false);
  const [, updateState] = React.useState<{}>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  // --- Component host element
  const divHost = React.createRef<HTMLDivElement>();

  // --- Handle integer height
  if (integralPosition) {
    itemHeight = Math.round(itemHeight);
  }

  // --- Init internal variables
  let mouseLeft = false;
  let isSizing = false;
  const innerHeight = numItems * itemHeight;

  // --- Render the items according to the top position
  const renderItems = () => {
    const scrollPos = divHost.current.scrollTop;
    const { startIndex, endIndex } = getViewPort();
    const tmpItems: React.ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const item = renderItem(i, {
        position: "absolute",
        top: `${i * itemHeight}px`,
        width: "fit-content",
        overflowX: "hidden",
        whiteSpace: "nowrap",
      });
      tmpItems.push(item);
    }
    setItems(tmpItems);
    if (divHost?.current) {
      divHost.current.scrollTop = scrollPos;
    }
  };

  // --- Initialize/update the virtualized list
  useEffect(() => {
    if (mounted.current) {
      // --- Render items (once) whenever we know the height of the viewport
      updateDimensions();
      if (divHost.current.offsetHeight !== 0 && !initialized.current) {
        renderItems();
        initialized.current = true;
      }
    } else {
      // --- Initialize the component
      registerApi?.({
        forceRefresh: () => forceRefresh(),
        scrollToItemByIndex: (index) => scrollToItemByIndex(index),
        scrollToTop: () => scrollToTop(),
        scrollToEnd: () => scrollToEnd(),
        getViewPort: () => getViewPort(),
      });
      updateDimensions();
      mounted.current = true;
    }
  });

  return (
    <>
      <div
        tabIndex={focusable ? 0 : -1}
        ref={divHost}
        className="scroll"
        style={{ overflow: "hidden" }}
        onScroll={(e) => {
          console.log(e);
          updateDimensions();
          renderItems();
        }}
        onWheel={(e) => {
          divHost.current.scrollTop = normalizeScrollPosition(
            divHost.current.scrollTop + e.deltaY / 4
          );
        }}
        onKeyDown={(e) => {
          handleScrollKeys(
            divHost.current,
            e.key,
            e.ctrlKey,
            itemHeight,
            integralPosition
          );
        }}
      >
        <div
          className="inner"
          style={{
            position: "relative",
            height: `${innerHeight}px`,
          }}
          onMouseEnter={() => {
            setPointed(true);
            mouseLeft = false;
          }}
          onMouseLeave={() => {
            setPointed(isSizing);
            mouseLeft = true;
          }}
        >
          {items}
        </div>
      </div>
      <FloatingScrollbar
        direction="vertical"
        barSize={10}
        forceShow={pointed}
        registerApi={(api) => (verticalApi.current = api)}
        moved={(delta) => {
          if (divHost?.current) {
            divHost.current.scrollTop = normalizeScrollPosition(delta);
          }
        }}
        sizing={(nowSizing) => {
          isSizing = nowSizing;
          if (!nowSizing && mouseLeft) {
            setPointed(false);
          }
        }}
      />
      <FloatingScrollbar
        direction="horizontal"
        barSize={10}
        forceShow={pointed}
        registerApi={(api) => (horizontalApi.current = api)}
        moved={(delta) => {
          if (divHost?.current) {
            divHost.current.scrollLeft = delta;
          }
        }}
        sizing={(nowSizing) => {
          isSizing = nowSizing;
          if (!nowSizing && mouseLeft) {
            setPointed(false);
          }
        }}
      />
    </>
  );

  // --------------------------------------------------------------------------
  // Virtualized list API

  /**
   * Asks the component to update its viewport
   */
  function forceRefresh() {
    forceUpdate();
  }

  /**
   * Scrolls to the item with the specified index
   * @param index
   */
  function scrollToItemByIndex(index: number) {
    const topPos = normalizeScrollPosition(index * itemHeight);
    tmpScrollPos.current = normalizeScrollPosition(topPos);
    forceRefresh();
  }

  /**
   * Scrolls to the top of the list
   * @param index
   */
  function scrollToTop() {
    tmpScrollPos.current = 0;
    forceRefresh();
  }

  /**
   * Scrolls to the end of the list
   * @param index
   */
  function scrollToEnd() {
    tmpScrollPos.current = 10_000_000;
    forceRefresh();
  }

  /**
   * Gets the top and bottom item index of the virtual list's viewport
   * @returns
   */
  function getViewPort(): { startIndex: number; endIndex: number } {
    const scrollPos = divHost.current.scrollTop;
    return {
      startIndex: Math.floor(scrollPos / itemHeight),
      endIndex: Math.min(
        numItems - 1, // don't render past the end of the list
        Math.floor((scrollPos + divHost.current.offsetHeight) / itemHeight)
      ),
    };
  }

  // --------------------------------------------------------------------------
  // Helper functions
  /**
   * Updates scrollbars according to the panel's dimension changes
   */
  function updateDimensions(): void {
    verticalApi.current?.signHostDimension({
      hostLeft: divHost.current.offsetLeft,
      hostTop: divHost.current.offsetTop,
      hostSize: divHost.current.offsetHeight,
      hostCrossSize: divHost.current.offsetWidth,
      hostScrollPos: divHost.current.scrollTop,
      hostScrollSize: divHost.current.scrollHeight,
    });
    horizontalApi.current?.signHostDimension({
      hostLeft: divHost.current.offsetLeft,
      hostTop: divHost.current.offsetTop,
      hostSize: divHost.current.offsetWidth,
      hostCrossSize: divHost.current.offsetHeight,
      hostScrollPos: divHost.current.scrollLeft,
      hostScrollSize: divHost.current.scrollWidth,
    });
    if (tmpScrollPos.current >= 0) {
      divHost.current.scrollTop = tmpScrollPos.current;
      tmpScrollPos.current = -1;
    }
  }

  /**
   * Calculates normalized scrollposition
   * @param newPosition
   */
  function normalizeScrollPosition(newPosition: number): number {
    return integralPosition
      ? Math.floor(newPosition / itemHeight) * itemHeight
      : newPosition;
  }
}
