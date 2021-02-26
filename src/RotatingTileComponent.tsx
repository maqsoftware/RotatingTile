import powerbi from "powerbi-visuals-api";
import * as React from "react";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { State } from "./interfaces";
import { Constants } from "./Constants";

export const initialState: State = {
  measureData: [
    {
      name: "",
      value: ""
    },
  ],
  valueFontColor: "",
  titleFontColor: "",
  rotationCount: 0,
  rotationAxis: "",
  measureNameDisplay: "inline",
  measureValueDisplay: "inline",
  animationDuration: 4
};

export class RotatingTileComponent extends React.Component<{}, State> {
  private rotationId: number;
  private frameRotationId: number;
  private measureCount: number = 0;
  private selectionManager: ISelectionManager;
  private ref = null;
  private constants = new Constants();

  constructor(props: any) {
    super(props);
    this.state = initialState;
    this.ref = React.createRef();
  }

  /**
   * This Function has the logic for rotation
   * It calls the rotation function after every x seconds
   */
  rotate = (): void => {
    clearInterval(this.rotationId);
    this.rotationId = setInterval(
      () => this.rotation(),
      this.state.animationDuration
    );
  }

  /**
   * This Function calls frame function which rotates the frame after every 5ms
   */
  rotation = (): void => {
    clearInterval(this.frameRotationId);
    this.frameRotationId = setInterval(() => this.frameRotation(), 5);
  }

  /**
   * This Function rotates the frame from 0 to 90deg and then from -90 to 0deg in every 5ms
   */
  frameRotation = (): void => {
    let rotationdeg: number = this.state.rotationCount;
    rotationdeg++;
    if (rotationdeg === this.constants.rightAngle) {
      rotationdeg = -this.constants.rightAngle;
      this.measureCount = (this.measureCount + 1) % this.state.measureData.length;
    } else if (rotationdeg === 0) {
      clearInterval(this.frameRotationId);
    }
    this.setState({
      rotationCount: rotationdeg,
    });
  }

  /**
   * This Function is for the click functionality. When the container is clicked it rotates
   */
  onClickRotate = (): void => {
    clearInterval(this.rotationId);
    this.rotation();
    this.rotationId = setInterval(
      () => this.rotation(),
      this.state.animationDuration
    );
  }

  /**
   * Update Callback Function
   */
  private static updateCallback: (data: object) => void = null;

  /**
   * Update functions
   * @param newState 
   */
  public static UPDATE(newState: State) {
    RotatingTileComponent.updateCallback?.(newState);
  }

  /**
   *Did Mount Function
   */
  public componentDidMount() {
    RotatingTileComponent.updateCallback = (newState: State): void => {
      this.setState(newState);
      this.selectionManager = newState.selectionManager;
    }
  }

  /**
   * Will make the visual to null when removed
   */
  public componentWillUnmount() {
    RotatingTileComponent.updateCallback = null;
  }

  /**
   * Calls the function to rotate after 
   * render function is called
   */
  public componentDidUpdate() {
    this.rotate();
  }

  /**
   * Used for Context Menu
   * @param e 
   */
  showContextMenuInVisual = (e) => {
    e.preventDefault();
    this.selectionManager.showContextMenu(this.ref.currentTarget, {
      x: e.clientX,
      y: e.clientY,
    });
  }

  render() {
    const {
      viewport,
      rotationAxis,
      rotationCount,
      boxBackgroundColor,
      boxBorderColor,
      valueFontSize,
      valueFontColor,
      titleFontSize,
      titleFontColor,
      measureNameDisplay,
      measureValueDisplay,
      mainContainerHeight,
      mainContainerWidth,
      mainContainerTop,
      mainContainerMargin,
      measureData
    } = this.state;

    if (this.measureCount >= this.state.measureData.length) {
      this.measureCount = 0;
    }

    return (
      <div
        className={this.constants.baseContainerId}
        style={{
          height: viewport?.height,
          width: viewport?.width,
        }}
        ref={this.ref}
        onContextMenu={this.showContextMenuInVisual}
      >
        <div
          className={this.constants.mainContainerId}
          style={{
            transform: `rotate${rotationAxis}(${rotationCount}deg)`,
            backgroundColor: boxBackgroundColor,
            border: boxBorderColor,
            top: mainContainerTop,
            height: mainContainerHeight,
            width: mainContainerWidth,
            margin: mainContainerMargin
          }}
          onClick={this.onClickRotate}
          role="button"
        >
          <div className={this.constants.boxId}>
            <span
              className={this.constants.measureValueId}
              style={{
                fontSize: valueFontSize,
                color: valueFontColor,
                display: measureValueDisplay,
              }}
            >
              {measureData[this.measureCount]?.value}
            </span>

            <br />

            <span
              className={this.constants.measureNameId}
              style={{
                fontSize: titleFontSize,
                color: titleFontColor,
                display: measureNameDisplay,
              }}
            >
              {measureData[this.measureCount]?.name}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
export default RotatingTileComponent;
