import { forwardRef } from "react";
import { Sprite, Texture } from "three";

type Color = { r: number, g: number, b: number, a: number };

type Parameters = {
  fontface?: string,
  fontsize?: number,
  borderThickness?: number,
  borderColor?: Color,
  backgroundColor?: Color,
}

type Props = { message: string, parameters?: Parameters, position?: [number, number, number] };
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const createTexture = (message: Props['message'], parameters: Props['parameters']) => {
  if (parameters === undefined) parameters = {};
  const fontface = parameters.fontface ?? "Arial";
  const fontsize = parameters.fontsize ?? 25;
  const borderThickness = parameters.borderThickness ?? 4;
  const borderColor = parameters.borderColor ?? { r: 0, g: 0, b: 0, a: 1.0 };
  const backgroundColor = parameters.backgroundColor ?? { r: 255, g: 255, b: 255, a: 1.0 };
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) return null;

  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)

  const metrics = context.measureText(message);
  const textWidth = metrics.width;

  // background color
  context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
    + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
    + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  // roundRect(context, borderThickness/2+50, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 19);
  roundRect(context, borderThickness / 2 + 65, borderThickness / 2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 19);

  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText(message, borderThickness + 65, fontsize + borderThickness);
  return new Texture(canvas);
}

export const TextSprite = forwardRef<Sprite, Props>((
  { message, parameters, position }: Props, ref) => {
  const texture = createTexture(message, parameters);
  if (texture === null) return null;
  texture.needsUpdate = true;
  return (
    <sprite scale={[10, 5, 1]} position={position} ref={ref}>
      <spriteMaterial map={texture} depthTest={true} transparent={true} />
    </sprite>
  );
});