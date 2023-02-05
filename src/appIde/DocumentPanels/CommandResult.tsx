import { SmallIconButton } from "@/controls/common/IconButton";
import { Label, LabelSeparator } from "@/controls/common/Labels";
import { ToolbarSeparator } from "@/controls/common/ToolbarSeparator";
import { VirtualizedListApi } from "@/controls/common/VirtualizedList";
import { VirtualizedListView } from "@/controls/common/VirtualizedListView";
import { useDispatch, useRendererContext } from "@/core/RendererProvider";
import { useInitializeAsync } from "@/core/useInitializeAsync";
import { setIdeStatusMessageAction } from "@state/actions";
import { useEffect, useRef, useState } from "react";
import { CommandResultData } from "../abstractions";
import { DocumentProps } from "../DocumentArea/DocumentsContainer";
import { useAppServices } from "../services/AppServicesProvider";
import { OutputLine } from "../ToolArea/OutputPanel";
import styles from "./CommandResult.module.scss";

type CommandResultViewState = {
  topIndex?: number;
};

const CommandResultPanel = ({ document, data }: DocumentProps) => {
  // --- Read the view state of the document
  const viewState = useRef(
    (document.stateValue as CommandResultViewState) ?? {}
  );
  const topIndex = useRef(viewState.current?.topIndex ?? 0);
  const title = (data as CommandResultData)?.title;
  const output = (data as CommandResultData)?.lines ?? [];
  const bufferText = (data as CommandResultData)?.bufferText;

  // --- Get the services used in this component
  const dispatch = useDispatch();
  const { documentService } = useAppServices();

  // --- Use these options to set memory options. As memory view is async, we sometimes
  // --- need to use state changes not yet committed by React.

  const refreshInProgress = useRef(false);
  const vlApi = useRef<VirtualizedListApi>(null);
  const [scrollVersion, setScrollVersion] = useState(0);

  // --- This function refreshes the memory
  const refreshView = async () => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    try {
      // TODO
    } finally {
      refreshInProgress.current = false;
    }
  };

  // --- Initial view: refresh the disassembly lint and scroll to the last saved top position
  useInitializeAsync(async () => {
    await refreshView();
    setScrollVersion(scrollVersion + 1);
  });

  // --- Scroll to the desired position whenever the scroll index changes
  useEffect(() => {
    vlApi.current?.scrollToIndex(topIndex.current, {
      align: "start"
    });
  }, [scrollVersion]);

  // --- Save the current top addresds
  const storeTopAddress = () => {
    const range = vlApi.current.getRange();
    topIndex.current = range.startIndex;
  };

  // --- Save the new view state whenever the view is scrolled
  const scrolled = () => {
    if (!vlApi.current) return;

    storeTopAddress();
    saveViewState();
  };

  // --- Save the current view state
  const saveViewState = () => {
    const mergedState: CommandResultViewState = {
      topIndex: topIndex.current
    };
    documentService.saveActiveDocumentState(mergedState);
  };

  return (
    <div className={styles.commandResultPanel}>
      <div className={styles.header}>
        <SmallIconButton
          iconName='copy'
          title={"Copy to clipboard"}
          clicked={async () => {
            navigator.clipboard.writeText(bufferText);
            dispatch(
              setIdeStatusMessageAction(
                "Command output text copied to the clipboard",
                true
              )
            );
          }}
        />
        <ToolbarSeparator small={true} />
        <LabelSeparator width={8} />
        <Label text={title} />
      </div>
      <div className={styles.listWrapper}>
        <VirtualizedListView
          items={output}
          approxSize={20}
          fixItemHeight={false}
          scrolled={scrolled}
          apiLoaded={api => (vlApi.current = api)}
          itemRenderer={idx => {
            return (
              <div className={styles.item}>
                <LabelSeparator width={4} />
                <OutputLine spans={output[idx].spans} />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export const createCommandResultPanel = ({ document, data }: DocumentProps) => (
  <CommandResultPanel document={document} data={data} />
);
