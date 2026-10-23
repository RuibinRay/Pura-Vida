// Chapter 6: the owner's title poster as the end card, graded toward sunset as the visitor reaches the end.
import { PlateBox, PlateImage } from './Plate';

export function ClosingPlate() {
  return (
    <div className="stage__close">
      <PlateBox plate="poster" className="plate--poster">
        <PlateImage plate="poster" layer="base" className="plate__base" />
        <div className="plate__grade" />
        <div className="plate__sun" />
      </PlateBox>
      <div className="stage__vignette stage__vignette--close" />
    </div>
  );
}
