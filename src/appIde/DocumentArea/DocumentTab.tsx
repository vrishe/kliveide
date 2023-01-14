import styles from "./DocumentTab.module.scss";
import { DocumentState } from "@/appIde/abstractions";
import { Icon } from "../../controls/common/Icon";
import classnames from "@/utils/classnames";
import { useDispatch } from "@/core/RendererProvider";
import {
  activateDocumentAction,
  changeDocumentAction,
  closeDocumentAction
} from "@state/actions";
import { TabButton } from "../../controls/common/TabButton";
import { useLayoutEffect, useRef, useState } from "react";

export type Props = DocumentState & {
  index: number;
  iconName?: string;
  isActive?: boolean;
  tabDisplayed?: (el: HTMLDivElement) => void;
};

export const DocumentTab = ({
  index,
  id,
  name,
  type,
  isTemporary,
  isReadOnly = false,
  stateValue,
  path,
  language,
  iconName = "file-code",
  isActive = false,
  tabDisplayed
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [pointed, setPointed] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      tabDisplayed?.(ref.current);
    }
  }, [ref.current])
  return (
    <div
      ref={ref}
      className={classnames(styles.component, isActive ? styles.active : "")}
      onMouseEnter={() => setPointed(true)}
      onMouseLeave={() => setPointed(false)}
      onClick={() => dispatch(activateDocumentAction(id))}
      onDoubleClick={() => {
        if (isTemporary) {
          dispatch(
            changeDocumentAction(
              {
                id,
                name,
                type,
                isReadOnly,
                isTemporary: false,
                language,
                path,
                stateValue
              } as DocumentState,
              index
            )
          );
        }
      }}
    >
      <Icon
        iconName={iconName}
        width={16}
        height={16}
        fill='--color-doc-icon'
      />
      <span
        className={classnames(
          styles.titleText,
          isActive ? styles.activeTitle : "",
          isTemporary ? styles.temporaryTitle : ""
        )}
      >
        {name}
      </span>
      {isReadOnly && (
        <div className={styles.readOnlyIcon}>
          <Icon
            iconName='shield'
            width={16}
            height={16}
            fill={
              isActive
                ? "--color-readonly-icon-active"
                : "--color-readonly-icon-inactive"
            }
          />
        </div>
      )}
      <TabButton
        iconName='close'
        hide={!pointed && !isActive}
        fill={
          isActive
            ? "--color-tabbutton-fill-active"
            : "--color-tabbutton-fill-inactive"
        }
        clicked={() => dispatch(closeDocumentAction(id))}
      />
    </div>
  );
};
