import {
  Flag,
  Label,
  LabelSeparator,
  Secondary,
  Value
} from "@/controls/common/Labels";
import { useRendererContext, useSelector } from "@/core/RendererProvider";
import {
  EmuGetMemoryResponse,
  EmuGetSysVarsResponse
} from "@messaging/main-to-emu";
import { useEffect, useRef, useState } from "react";
import { toHexa2, toHexa4 } from "../services/interactive-commands";
import { useStateRefresh } from "../useStateRefresh";
import styles from "./SysVarsPanel.module.scss";
import { VirtualizedListView } from "@/controls/common/VirtualizedListView";
import { SysVar, SysVarType } from "@/emu/abstractions/SysVar";
import { TooltipFactory } from "@/controls/common/Tooltip";

const VAR_WIDTH = 64;
const VALUE_WIDTH = 40;
const FLAG_WIDTH = 16;

type SysVarData = {
  sysVar: SysVar;
  length: number;
  value?: number;
  valueList?: Uint8Array;
};

const SysVarsPanel = () => {
  const { messenger } = useRendererContext();
  const [sysVars, setSysVars] = useState<SysVarData[]>([]);
  const machineState = useSelector(s => s.emulatorState?.machineState);

  // --- This function queries the breakpoints from the emulator
  const refreshSysVars = async () => {
    // --- Get breakpoint information
    const sysVarsResponse = (await messenger.sendMessage({
      type: "EmuGetSysVars"
    })) as EmuGetSysVarsResponse;
    const memResponse = (await messenger.sendMessage({
      type: "EmuGetMemory"
    })) as EmuGetMemoryResponse;
    const memory = memResponse.memory;
    const vars = sysVarsResponse.sysVars.map(sv => {
      const addr = sv.address;
      let value: number;
      let valueList: Uint8Array;
      let length = 1;
      switch (sv.type) {
        case SysVarType.Byte:
        case SysVarType.Flags:
          value = memory[addr];
          break;
        case SysVarType.Word:
          value = memory[addr] + (memory[addr + 1] << 8);
          length = 2;
          break;
        case SysVarType.Array:
          valueList = new Uint8Array(sv.length ?? 0);
          length = valueList.length;
          for (let i = 0; i < (sv.length ?? 0); i++) {
            valueList[i] = memory[addr + i];
          }
      }
      return {
        sysVar: sv,
        value,
        valueList,
        length
      } as SysVarData;
    });
    setSysVars(vars);
  };

  // --- Whenever machine state changes or breakpoints change, refresh the list
  useEffect(() => {
    (async function () {
      await refreshSysVars();
    })();
  }, [machineState]);

  // --- Take care of refreshing the screen
  useStateRefresh(500, async () => {
    await refreshSysVars();
  });

  return (
    <div className={styles.sysVarsPanel}>
      {sysVars.length === 0 && (
        <div className={styles.center}>No system variables available</div>
      )}
      {sysVars.length > 0 && (
        <VirtualizedListView
          items={sysVars}
          approxSize={20}
          fixItemHeight={false}
          itemRenderer={idx => {
            const item = sysVars[idx];
            const sysVar = item.sysVar;
            const value = item.value;
            const valueList = item.valueList;
            const length = item.length;
            const type = sysVar.type;
            const tooltip = `${sysVar.name}: $${toHexa4(sysVar.address)} (${
              sysVar.address
            }), length: ${length}\n${sysVar.description}`;
            return (
              <div className={styles.sysVar}>
                <LabelSeparator width={4} />
                <Label text={sysVar.name} width={VAR_WIDTH} tooltip={tooltip} />
                <div className={styles.sysVarValue}>
                  {type === SysVarType.Byte && (
                    <>
                      <LabelSeparator width={2} />
                      <Value text={toHexa2(value ?? 0)} width={VALUE_WIDTH} />
                      <Secondary text={`(${value})`} />
                    </>
                  )}
                  {type === SysVarType.Word && (
                    <>
                      <LabelSeparator width={2} />
                      <Value text={toHexa4(value ?? 0)} width={VALUE_WIDTH} />
                      <Secondary text={`(${value})`} />
                    </>
                  )}
                  {type === SysVarType.Array && (
                    <FullDumpSection sysVarData={item} />
                  )}
                  {type === SysVarType.Flags && (
                    <FlagRow value={value} flagDescriptions={sysVar.flagDecriptions} />
                  )}
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
};

type FullDumpProps = {
  sysVarData: SysVarData;
};

const FullDumpSection = ({ sysVarData }: FullDumpProps) => {
  const dumpItems: JSX.Element[] = [];
  for (let i = 0; i < (sysVarData.valueList?.length ?? 0); i += 8) {
    const dumpValue = <DumpSection key={i} sysVarData={sysVarData} index={i} />;
    dumpItems.push(dumpValue);
  }
  return <div className={styles.dumpRows}>{dumpItems}</div>;
};

type DumpProps = {
  sysVarData: SysVarData;
  index: number;
};

const DumpSection = ({ sysVarData, index }: DumpProps) => {
  const byteItems: JSX.Element[] = [];
  for (
    let i = index;
    i < index + 8 && i < (sysVarData.valueList?.length ?? 0);
    i++
  ) {
    const byteValue = (
      <ByteValue
        key={i}
        address={sysVarData.sysVar.address + i}
        value={sysVarData.valueList[i]}
        tooltip={sysVarData.sysVar.byteDescriptions[i] ?? ""}
      />
    );
    byteItems.push(byteValue);
  }
  return <div className={styles.dumpSection}>{byteItems}</div>;
};

type ByteValueProps = {
  address: number;
  value: number;
  tooltip?: string;
};

const ByteValue = ({ address, value, tooltip }: ByteValueProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const title = `Address: $${toHexa4(address)}, Value: $${toHexa2(
    value
  )} (${value})\n${tooltip ?? ""}`;
  const toolTipLines = title.split("\n");
  return (
    <div ref={ref} className={styles.byteValue}>
      {toHexa2(value)}
      {tooltip && (
        <TooltipFactory
          refElement={ref.current}
          placement='right'
          offsetX={8}
          offsetY={32}
          showDelay={100}
        >
          {toolTipLines.map((l, idx) => (
            <div key={idx}>{l}</div>
          ))}
        </TooltipFactory>
      )}
    </div>
  );
};

type FlagProps = {
  flagDescriptions: string[];
  value: number;
}

const FlagRow = ({value, flagDescriptions}:FlagProps) => {
  return (
    <div className={styles.dumpSection}>
      <Flag value={value & 0x80} tooltip={`Bit 7: ${flagDescriptions?.[7] ?? ""}`} />
      <Flag value={value & 0x40} tooltip={`Bit 6: ${flagDescriptions?.[6] ?? ""}`} />
      <Flag value={value & 0x20} tooltip={`Bit 5: ${flagDescriptions?.[5] ?? ""}`} />
      <Flag value={value & 0x10} tooltip={`Bit 4: ${flagDescriptions?.[4] ?? ""}`} />
      <Flag value={value & 0x08} tooltip={`Bit 3: ${flagDescriptions?.[3] ?? ""}`} />
      <Flag value={value & 0x04} tooltip={`Bit 2: ${flagDescriptions?.[2] ?? ""}`} />
      <Flag value={value & 0x02} tooltip={`Bit 1: ${flagDescriptions?.[1] ?? ""}`} />
      <Flag value={value & 0x01} tooltip={`Bit 0: ${flagDescriptions?.[0] ?? ""}`} />
    </div>
  )
}

export const sysVarsPanelRenderer = () => <SysVarsPanel />;
