import { forwardRef, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { Sprite, Texture } from "three";
import { Store, useStore } from "../state";
import { CityName } from "../coordinates";
import { useFrame } from "@react-three/fiber";
import { ObjectType } from "../utils";

type Color = { r: number, g: number, b: number, a: number };

type TextureParameters = {
  fontface?: string,
  fontsize?: number,
  borderThickness?: number,
  borderColor?: Color,
  backgroundColor?: Color,
  scale?: [number, number, number]
}

type SpriteArguments = { message: string, parameters?: TextureParameters, position?: [number, number, number] };
type Labels = { [key in CityName]?: string };
type GenerateLabelsStrategy = (citiesRef: Store['citiesRef']) => Labels;

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

const createTexture = (message: SpriteArguments['message'], parameters: SpriteArguments['parameters']) => {
  if (parameters === undefined) parameters = {};
  const fontface = parameters.fontface ?? "Arial";
  const fontsize = parameters.fontsize ?? 25;
  const borderThickness = parameters.borderThickness ?? 4;
  const borderColor = parameters.borderColor ?? { r: 225, g: 0, b: 0, a: 1.0 };
  const backgroundColor = parameters.backgroundColor ?? { r: 225, g: 140, b: 0, a: 0.9 };
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) throw new Error("could not reacte sprite canvas");

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

export const directLabelStrategy: GenerateLabelsStrategy = (citiesRef) => {
  const ans: Labels = {};
  for (const key of Object.keys(citiesRef.current) as CityName[]) {
    ans[key] = key.charAt(0).toUpperCase() + key.slice(1);
  }
  return ans;
}

export const alphabeticLabelStrategy: GenerateLabelsStrategy = (citiesRef) => {
  const ans: Labels = {};
  for (let i = 0; i < Object.keys(citiesRef.current).length; i++) {
    const key = Object.keys(citiesRef.current)[i] as CityName;
    ans[key] = String.fromCharCode(i + 65);
  }
  return ans;
}


export function Sprites({ type, generateLabels, TextSprite }: { type: ObjectType, generateLabels?: GenerateLabelsStrategy, TextSprite?: typeof DefaultTextSprite }) {
  if (TextSprite === undefined) TextSprite = DefaultTextSprite;
  if (generateLabels === undefined) generateLabels = directLabelStrategy;
  const [isSet, setIsSet] = useState(false);
  const spritesRef = useRef<ReactNode[]>([]);
  const citiesRef = useStore(state => state.citiesRef);
  const getTruePositions = useStore(state => state.getTruePositions);
  useFrame(() => {
    if (
      isSet ||
      citiesRef.current == null ||
      Object.keys(citiesRef.current).length !== Object.keys(getTruePositions()).length
    ) return;
    spritesRef.current = [];
    const labels = generateLabels(citiesRef);
    for (const cityName of Object.keys(labels) as CityName[]) {
      spritesRef.current.push(
        <SpriteWrapper key={cityName} message={labels[cityName] ?? ""} cityName={cityName} type={type} TextSprite={TextSprite} />
      )
    }
    setIsSet(true);
  })
  return spritesRef.current;
}

const useSpritePositionManager = (type: ObjectType, ref: MutableRefObject<Sprite>, cityName: CityName) => {
  const citiesRef = useStore(state => state.citiesRef);
  useFrame(() => {
    const city = citiesRef.current[cityName];
    if (city === undefined) return;
    ref.current.position.copy(city.position);

    if (type === 'sphere') {
      ref.current.position.multiplyScalar(1.05);
    }
  })

}

export function SpriteWrapper({ type, message, cityName, TextSprite }: { type: ObjectType, message: string, cityName: CityName, TextSprite: typeof DefaultTextSprite }) {
  const ref = useRef<Sprite>(null!);
  useSpritePositionManager(type, ref, cityName);
  return (<TextSprite ref={ref} message={message} />);
}

export const TextSpriteFactory = (parameters?: TextureParameters) => {
  if (parameters === undefined) parameters = {}
  if (parameters.scale === undefined) parameters.scale = [10, 5, 1];
  return forwardRef<Sprite, { message: string }>(({ message }, ref) => {
    const texture = createTexture(message, parameters);
    texture.needsUpdate = true;
    return (
      <sprite scale={parameters.scale} position={[0, 0, 0]} ref={ref}>
        <spriteMaterial map={texture} depthTest={true} transparent={true} />
      </sprite>
    );
  });
}

export const DefaultTextSprite = TextSpriteFactory();



