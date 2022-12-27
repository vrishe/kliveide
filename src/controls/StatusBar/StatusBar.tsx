import { useController } from "@/core/useController";
import { useSelector } from "@/emu/StoreProvider";
import { useIdeServices } from "@/ide/IdeServicesProvider";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "../common/Icon";
import { SpaceFiller } from "../common/SpaceFiller";
import { FrameStats } from "../../emu/abstractions/FrameStats";
import classnames from "../../utils/classnames"
import styles from "./StatusBar.module.scss";

export const StatusBar = () => {
    const {machineService } = useIdeServices();
    const controller = useController();
    const [frameStats, setFrameStats] = useState<FrameStats>();
    const machineId = useSelector(s => s.ideView?.machineId);
    const [machineName, setMachineName] = useState("");
    const counter = useRef(0);

    // --- Reflect controller changes
    useEffect(() => {
        if (machineId) {
            const info = machineService.getMachineInfo();
            setMachineName(info?.displayName ?? "");
        }
        if (controller) {
            controller.frameCompleted.on((completed) => {
                if (!completed || counter.current++ % 10) {
                    setFrameStats({...controller.frameStats});
                }
            })
        }

    }, [controller]);

    return <div className={styles.component}>
        <div className={styles.sectionWrapper}>
            <Section>
                <Icon iconName="vm-running" width={16} height={16} fill="--color-statusbar-icon" />
                <LabelSeparator />
                <DataLabel value={frameStats?.lastCpuFrameTimeInMs ?? 0.0} />
                <Label text="/" />
                <DataLabel value={frameStats?.avgCpuFrameTimeInMs ?? 0.0} />
            </Section>
            <SectionSeparator />
            <Section>
                <Icon iconName="vm" width={16} height={16} fill="--color-statusbar-icon" />
                <LabelSeparator />
                <DataLabel value={frameStats?.lastFrameTimeInMs ?? 0.0} />
                <Label text="/" />
                <DataLabel value={frameStats?.avgFrameTimeInMs ?? 0.0} />
            </Section>
            <SectionSeparator />
            <Section>
                <Icon iconName="window" width={16} height={16} fill="--color-statusbar-icon" />
                <LabelSeparator />
                <DataLabel 
                    value={(frameStats?.frameCount ?? 0)} 
                    minimumFractionDigits={0}
                    maximumFractionDigits={0}/>
            </Section>
            <SectionSeparator />
            <Section>
                <Label text="PC:" />
                <LabelSeparator />
                <Label 
                    text={(controller?.machine?.pc ?? 0).toString(16).toUpperCase().padStart(4, "0")}
                    isMonospace={true} />
            </Section>
            <SpaceFiller />
            <Label text={machineName} />
        </div>
    </div>
}

const Section = ({children}: SectionProps) => {
    return <div className={styles.section}>{children}</div>
}

type LabelProps = {
    text: string;
    isMonospace?: boolean;
}

const Label = ({
    text,
    isMonospace
}: LabelProps ) => {
    return (
        <span className={classnames(
            styles.label,
            isMonospace ? styles.isMonospace : "")}>
            {text}
        </span>
    )
}

type SectionProps = {
    children: ReactNode;
}

type DataLabelProps = {
    value: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    minimumIntegerDigits?: number;

}
const DataLabel = ({
    value,
    minimumFractionDigits = 3,
    maximumFractionDigits = 3,
    minimumIntegerDigits = 2
}: DataLabelProps) => {
    return <Label text={value.toLocaleString(undefined, {
        minimumFractionDigits,
        maximumFractionDigits,
        minimumIntegerDigits
      })} isMonospace={true} />
}

const LabelSeparator = () => <div className={styles.labelSeparator} />
const SectionSeparator = () => <div className={styles.sectionSeparator} />