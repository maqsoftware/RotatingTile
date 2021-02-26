"use strict";
import "regenerator-runtime/runtime";
import powerbi from "powerbi-visuals-api";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { createTooltipServiceWrapper, ITooltipServiceWrapper, TooltipEventArgs } from "powerbi-visuals-utils-tooltiputils"
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { IValueFormatter } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { initialState, RotatingTileComponent } from "./RotatingTileComponent";
import { LabelSettings, VisualSettings } from "./settings";
import { DataPoint } from "./interfaces";
import { Constants } from "./Constants";
import "./../style/visual.less";

export class Visual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHost;
    private reactRoot: React.ComponentElement<any, any>;
    private measureData: DataPoint[];
    private tooltipDataPoints: DataPoint[];
    private measureCount: number;
    private viewport: IViewport;
    private selectionManager: ISelectionManager;
    private visualSettings: VisualSettings;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private constants = new Constants();
    private events: IVisualEventService;

    constructor(options: VisualConstructorOptions) {
        this.reactRoot = React.createElement(RotatingTileComponent, {});
        this.target = options.element;
        this.measureData = [];
        this.events = options.host.eventService;
        this.host = options.host;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
        ReactDOM.render(this.reactRoot, this.target);
    }

    /**
     * @param measureData 
     * Used to get Tooltip Data
     */
    private getTooltipData(measureData): VisualTooltipDataItem[] {
        let tooltipData: VisualTooltipDataItem[] = [];
        if (measureData.length) {
            for (let index = 0; index < measureData.length; index++) {
                let tooltipDataPoint: VisualTooltipDataItem = {
                    displayName: measureData[index].name,
                    value: measureData[index].value
                }
                tooltipData.push(tooltipDataPoint);
            }
        }
        return tooltipData;
    };

    /**
     * @param options 
     */
    public update(options: VisualUpdateOptions) {
        try {
            this.events.renderingStarted(options);
            if (options?.dataViews[0]?.table?.rows) {
                let measureNameDisplay: string;
                let measureValueDisplay: string;
                const dataView: DataView = options.dataViews[0];
                this.viewport = options.viewport;
                this.measureCount = dataView.table.columns.length;
                // Parsing Visual Settings to the DataView 
                this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
                //Set Min Duration to 2 and Max Duration to 10
                const animationSettings = this.visualSettings.animationSettings;
                this.visualSettings.animationSettings.duration = Math.max(this.constants.measureValueFontSizeRatio, animationSettings.duration);
                this.visualSettings.animationSettings.duration = Math.min(this.constants.animationSettingsMax, animationSettings.duration);
                //Set Text Precision from 0 to 4
                const labelSettings = this.visualSettings.labelSettings;
                this.visualSettings.labelSettings.textPrecision = Math.max(this.constants.textPrecisionMin, labelSettings.textPrecision);
                this.visualSettings.labelSettings.textPrecision = Math.min(this.constants.textPrecisionMax, labelSettings.textPrecision);
                let formatter: IValueFormatter = valueFormatter.create({});
                this.measureData = [];
                this.tooltipDataPoints = [];
                //Allocation of Data
                this.allocateData(dataView, options, formatter);
                //Hide Title if size of visual becomes very small
                const measureNameElement = document.getElementsByClassName(this.constants.measureNameId);
                const measureDataElement = document.getElementsByClassName(this.constants.measureValueId);
                const measureNameEl: number = measureNameElement[0].getBoundingClientRect().height;
                const measureDataEl: number = measureDataElement[0].getBoundingClientRect().height;
                const mainContainerEl = this.constants.mainContainerWidthRatio * options.viewport.height;
                if (measureDataEl + measureNameEl > mainContainerEl) {
                    measureNameDisplay = this.constants.measureNone;
                    measureValueDisplay = (measureDataEl > mainContainerEl) ? this.constants.measureNone : this.constants.measureInline;
                } else {
                    measureNameDisplay = this.constants.measureInline;
                }
                const effect3DSettings = this.visualSettings.vfxSettings;
                const rotationAxis: string = this.visualSettings.flipVertically.show ? "X" : "Y";
                const valueFontSize: number = this.visualSettings.labelSettings.fontSize * this.constants.measureValueFontSizeRatio;
                const valueFontColor: string = this.visualSettings.labelSettings.labelColor;
                const titleFontSize: number = this.visualSettings.titleSettings.fontSize;
                const titleColor: string = this.visualSettings.titleSettings.titleColor;
                const animationDuration: number = this.visualSettings.animationSettings.duration * this.constants.animationDurationConversion;
                const boxBackgroundColor: string = effect3DSettings.show ? effect3DSettings.bgColor : "";
                const boxBorderColor: string = effect3DSettings.show ? `1px solid ${effect3DSettings.borderColor}` : "";
                const mainContainerMargin: string = effect3DSettings.show ? this.constants.mainContainerMargin : "";
                const mainContainerHeight: string = effect3DSettings.show ? this.constants.mainContainerRatio : `${this.viewport.height}px`;
                const mainContainerWidth: string = effect3DSettings.show ? this.constants.mainContainerRatio : `${this.viewport.width}px`;
                const mainContainerTop: string = effect3DSettings.show ? `${this.viewport?.height / this.constants.mainContainerHeightRatio}px` : '';
                RotatingTileComponent.UPDATE({
                    measureData: this.measureData,
                    rotationAxis: rotationAxis,
                    valueFontSize: valueFontSize,
                    valueFontColor: valueFontColor,
                    titleFontSize: titleFontSize,
                    titleFontColor: titleColor,
                    viewport: this.viewport,
                    animationDuration: animationDuration,
                    boxBackgroundColor: boxBackgroundColor,
                    boxBorderColor: boxBorderColor,
                    mainContainerHeight: mainContainerHeight,
                    mainContainerWidth: mainContainerWidth,
                    mainContainerMargin: mainContainerMargin,
                    mainContainerTop: mainContainerTop,
                    measureNameDisplay: measureNameDisplay,
                    measureValueDisplay: measureValueDisplay,
                    selectionManager: this.selectionManager,
                });
                //Tooltip Render
                this.renderTooltip(this.tooltipDataPoints);
            } else {
                RotatingTileComponent.UPDATE(initialState);
            }
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options);
        }
    }

    /**
     * Render Function for Tooltip
     * @param measureData 
     */
    private renderTooltip(measureData) {
        const toolTipInfo: VisualTooltipDataItem[]  = this.getTooltipData(measureData);
        this.tooltipServiceWrapper.addTooltip(d3.selectAll(`.${this.constants.mainContainerId}`),
            (tooltipEvent: TooltipEventArgs<number>) => toolTipInfo);

    }

    /**
     * Function to allocate Data to the variables. Consists the logic for formatting of Data using 
     * Formatter and TextMeasurementService
     * @param dataView 
     * @param options 
     * @param formatter 
     */
    private allocateData(dataView: DataView, options: VisualUpdateOptions, formatter: IValueFormatter): void {
        for (let measure = 0; measure < this.measureCount; measure++) {
            const data: any = dataView.table.rows[0][measure];
            let tempdata = (!isNaN(data)) ? Math.round(data) : data;
            if (isNaN(tempdata)) {
                let mainContainerWidth: number = this.constants.mainContainerWidthRatio * options.viewport.width;
                let measureDataProperties: TextProperties = {
                    text: tempdata,
                    fontFamily: this.constants.fontFamily, fontSize: `${this.visualSettings.labelSettings.fontSize * this.constants.measureValueFontSizeRatio}px`
                };
                let measureNameProperties: TextProperties = {
                    text: dataView.table.columns[measure].displayName,
                    fontFamily: this.constants.fontFamily, fontSize: `${this.visualSettings.titleSettings.fontSize}px`
                };
                this.measureData.push({
                    name: textMeasurementService.getTailoredTextOrDefault(measureNameProperties, mainContainerWidth),
                    value: textMeasurementService.getTailoredTextOrDefault(measureDataProperties, mainContainerWidth)
                });
                this.tooltipDataPoints.push({
                    name: dataView.table.columns[measure].displayName,
                    value: data
                });
            }
            else {
                let val: number;
                const valLen: number = tempdata.toString().length;
                if (this.visualSettings.labelSettings.displayUnits === 0) {
                    if (valLen > this.constants.nine) {
                        val = this.constants.displayUnitsBillions;
                    } else if (valLen <= this.constants.nine && valLen > this.constants.six) {
                        val = this.constants.displayUnitMillions;
                    } else if (valLen <= this.constants.six && valLen >= this.constants.textPrecisionMax) {
                        val = this.constants.displayUnitThousands;
                    } else {
                        val = this.constants.displayUnitsNone;
                    }
                }
                const measureFormat: string = dataView.table.columns[measure].format;
                const labelSettings: LabelSettings = this.visualSettings.labelSettings;
                if ((String(measureFormat) === this.constants.dateFormat) ||
                    (String(measureFormat) === this.constants.undefinedString)) {
                    formatter = valueFormatter.create({
                        format: measureFormat
                    });
                } else {
                    formatter = valueFormatter.create({
                        format: measureFormat,
                        value: labelSettings.displayUnits === 0 ? val : labelSettings.displayUnits,
                        precision: labelSettings.textPrecision
                    });
                }
                tempdata = formatter.format(dataView.table.rows[0][measure]);
                let mainContainerWidth: number = this.constants.mainContainerWidthRatio * this.viewport.width;
                let measureDataProperties: TextProperties = {
                    text: tempdata,
                    fontFamily: this.constants.fontFamily,
                    fontSize: `${labelSettings.fontSize * this.constants.measureValueFontSizeRatio}px`
                };
                let measureNameProperties: TextProperties = {
                    text: dataView.table.columns[measure].displayName,
                    fontFamily: this.constants.fontFamily,
                    fontSize: `${this.visualSettings.titleSettings.fontSize}px`
                };
                this.measureData.push({
                    name: textMeasurementService.getTailoredTextOrDefault(measureNameProperties, mainContainerWidth),
                    value: textMeasurementService.getTailoredTextOrDefault(measureDataProperties, mainContainerWidth)
                });
                let tooltipDataFormatter = valueFormatter.create({
                    format: measureFormat
                });
                this.tooltipDataPoints.push({
                    name: dataView.table.columns[measure].displayName,
                    value: tooltipDataFormatter.format(data)
                });
            }
        }
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        return VisualSettings.enumerateObjectInstances(settings, options);
    }
}