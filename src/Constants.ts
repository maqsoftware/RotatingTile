"use strict";

export class Constants {
    public animationDurationConversion: number = 1000; //Converting Seconds to MilliSeconds
    public animationSettingsMax: number = 10; // Max Duration that can be set for the Animation
    public textPrecisionMin: number = 0; // Min Decimal Places
    public textPrecisionMax: number = 4; //Max Decimal Places
    public measureValueFontSizeRatio: number = 2; //Multiplied by the Measure Value font Size
    public mainContainerHeightRatio: number = 5; // Main container height to be divided by this
    public mainContainerWidthRatio: number = 0.6; // Main Container is 60% of Base Container
    public fontFamily: string = "Segoe UI Semibold,wf_segoe-ui_semibold,helvetica,arial,sans-serif";
    public measureNone: string = "none";
    public measureInline: string = "inline";
    public mainContainerMargin: string = "auto";
    public mainContainerRatio: string = "60%";
    public displayUnitsBillions: number = 1e9;
    public displayUnitMillions: number = 1e6;
    public displayUnitThousands: number = 1001;
    public displayUnitsNone: number = 10;
    public six: number = 6;
    public nine: number = 9;
    public dateFormat: string = "dd MMMM yyyy";
    public undefinedString: string = "undefined";
    public rightAngle: number = 90;
    public mainContainerId: string = "mainContainer";
    public baseContainerId: string = "baseContainer";
    public boxId: string = "box";
    public measureValueId: string = "measureValue";
    public measureNameId: string = "measureName";
}