import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;

export interface State {
    measureData?: DataPoint[];
    valueFontSize?: number;
    titleFontSize?: number;
    valueFontColor?: string;
    titleFontColor?: string;
    rotationCount?: number;
    rotationAxis?: string;
    animationDuration?: number;
    boxBackgroundColor?: string;
    boxBorderColor?: string;
    mainContainerHeight?: string;
    mainContainerWidth?: string;
    mainContainerTop?: string;
    mainContainerMargin?: string;
    measureNameDisplay?: string;
    measureValueDisplay?: string;
    selectionManager?: ISelectionManager;
    viewport?: powerbi.IViewport;
}

export interface DataPoint {
    name: string;
    value: string;
}
