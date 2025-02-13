import * as React from "react";
import { useSelector } from "react-redux";

import { getThemeService } from "@core/service-registry";

import { getVersion } from "../version";
import { AppState } from "@state/AppState";
import { Icon } from "@components/Icon";
import { StatusbarRoot, Section, Label, DataLabel } from "@components/StatusbarStyles";
import { getVmEngineService } from "@modules-core/vm-engine-service";
import { Column } from "@components/Panels";

/**
 * Represents the statusbar of the emulator
 */
export const EmuStatusbar: React.VFC = () => {
  // --- State selectors
  const showFrames = useSelector(
    (s: AppState) => s.emuViewOptions.showFrameInfo
  );
  const cpuFreq = useSelector(
    (s: AppState) =>
      s.emulatorPanel.clockMultiplier * s.emulatorPanel.baseClockFrequency
  );
  const vmEngineService = getVmEngineService();
  const displayName = useSelector(() =>
    vmEngineService.hasEngine
      ? vmEngineService.getEngine()?.displayName ?? ""
      : ""
  );
  const machineContext = useSelector(
    (s: AppState) => s.emulatorPanel.machineContext
  );
  const lastFrameTime = useSelector((s: AppState) =>
    s.emulatorPanel.frameDiagData.lastFrameTime.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  const lastEngineTime = useSelector((s: AppState) =>
    s.emulatorPanel.frameDiagData.lastEngineTime.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  const avgEngineTime = useSelector((s: AppState) =>
    s.emulatorPanel.frameDiagData.avgEngineTime.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  const avgFrameTime = useSelector((s: AppState) =>
    s.emulatorPanel.frameDiagData.avgFrameTime.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  const renderedFrames = useSelector(
    (s: AppState) => s.emulatorPanel.frameDiagData.renderedFrames
  );
  const pcInfo = useSelector(
    (s: AppState) => s.emulatorPanel.frameDiagData.pcInfo
  );

  const fillValue = getThemeService().getProperty(
    "--statusbar-foreground-color"
  );

  const frameInformation = [
    <Section key="1">
      <Icon iconName="vm-running" width={16} height={16} fill={fillValue} />
      <DataLabel>
        {avgEngineTime} / {lastEngineTime}
      </DataLabel>
    </Section>,
    <Section key="2" title="Total time per frame (average/last)">
      <Icon iconName="vm" width={16} height={16} fill={fillValue} />
      <DataLabel>
        {avgFrameTime} / {lastFrameTime}
      </DataLabel>
    </Section>,
    <Section key="3" title="# of frames rendered since start">
      <Icon iconName="window" width={16} height={16} fill={fillValue} />
      <DataLabel>{renderedFrames}</DataLabel>
    </Section>,
    <Section key="4" title="The value of Program Counter">
      <DataLabel>
        {pcInfo?.label ?? ""}: $
        {(pcInfo?.value ?? 0).toString(16).toUpperCase().padStart(4, "0")}
      </DataLabel>
    </Section>,
  ];
  const cpuInformation = [
    <Section key="14">
      <Label>{displayName}</Label>
    </Section>,
    <Section key="15">
      <Label>{machineContext}</Label>
    </Section>,
    <Section key="16">
      <Label>CPU: {(cpuFreq / 1000000).toFixed(4)}Mhz</Label>
    </Section>,
  ];
  return (
    <StatusbarRoot>
      {showFrames && frameInformation}
      <Column />
      {vmEngineService.hasEngine && cpuInformation}
      <Section>
        <Label>Klive {getVersion()}</Label>
      </Section>
    </StatusbarRoot>
  );
};
