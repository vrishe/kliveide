import React, {
  HTMLAttributes,
  ReactElement,
  useRef,
  useEffect,
  RefCallback,
  MutableRefObject,
  cloneElement
} from "react";

type FocusEvents = "focusin" | "focusout";
type MouseEvents = "click" | "mousedown" | "mouseup";
type TouchEvents = "touchstart" | "touchend";
type Events = FocusEvent | MouseEvent | TouchEvent;

interface Props extends HTMLAttributes<HTMLElement> {
  onClickAway: (event: Events) => void;
  focusEvent?: FocusEvents;
  mouseEvent?: MouseEvents;
  touchEvent?: TouchEvents;
  children: ReactElement<any>;
}

const eventTypeMapping = {
  click: "onClick",
  focusin: "onFocus",
  focusout: "onFocus",
  mousedown: "onMouseDown",
  mouseup: "onMouseUp",
  touchstart: "onTouchStart",
  touchend: "onTouchEnd"
};

export const ClickAwayListener = ({
  children,
  onClickAway,
  focusEvent = "focusin",
  mouseEvent = "click",
  touchEvent = "touchend"
}: Props) => {
  const node = useRef<HTMLElement | null>(null);
  const bubbledEventTarget = useRef<EventTarget | null>(null);
  const mountedRef = useRef(false);

  /**
   * Prevents the bubbled event from getting triggered immediately
   * https://github.com/facebook/react/issues/20074
   */
  useEffect(() => {
    setTimeout(() => {
      mountedRef.current = true;
    }, 0);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleBubbledEvents =
    (type: string) =>
    (event: Events): void => {
      bubbledEventTarget.current = event.target;

      const handler = children?.props[type];

      if (handler) {
        handler(event);
      }
    };

  const handleChildRef = (childRef: HTMLElement) => {
    node.current = childRef;

    let { ref } = children as typeof children & {
      ref: RefCallback<HTMLElement> | MutableRefObject<HTMLElement>;
    };

    if (typeof ref === "function") {
      ref(childRef);
    } else if (ref) {
      ref.current = childRef;
    }
  };

  useEffect(() => {
    const nodeDocument = node.current?.ownerDocument ?? document;

    const handleEvents = (event: Events): void => {
      if (!mountedRef.current) return;
      if (
        (node.current && node.current.contains(event.target as Node)) ||
        bubbledEventTarget.current === event.target ||
        !nodeDocument.contains(event.target as Node)
      ) {
        return;
      }
      onClickAway(event);
    };

    nodeDocument.addEventListener(mouseEvent, handleEvents);
    nodeDocument.addEventListener(touchEvent, handleEvents);
    nodeDocument.addEventListener(focusEvent, handleEvents);

    return () => {
      nodeDocument.removeEventListener(mouseEvent, handleEvents);
      nodeDocument.removeEventListener(touchEvent, handleEvents);
      nodeDocument.removeEventListener(focusEvent, handleEvents);
    };
  }, [focusEvent, mouseEvent, onClickAway, touchEvent]);

  const mappedMouseEvent = eventTypeMapping[mouseEvent];
  const mappedTouchEvent = eventTypeMapping[touchEvent];
  const mappedFocusEvent = eventTypeMapping[focusEvent];

  return React.Children.only(
    cloneElement(children as ReactElement<any>, {
      ref: handleChildRef,
      [mappedFocusEvent]: handleBubbledEvents(mappedFocusEvent),
      [mappedMouseEvent]: handleBubbledEvents(mappedMouseEvent),
      [mappedTouchEvent]: handleBubbledEvents(mappedTouchEvent)
    })
  );
};
