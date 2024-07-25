import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Points, Texture } from "three";
import { roundRect } from "../utils";

export function Stars() {
  const ref = useRef<Points>(null!);
  const starVerticies = useMemo(() => {
    const vertices = [];
    for (let i = 0; i < 50000; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      if (x * x + y * y + z * z > 120000) vertices.push(x, y, z);
    }
    return vertices;
  }, [])

  useFrame((_, delta) => {
    const speed = 0.01;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed;
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <float32BufferAttribute args={[starVerticies, 3]} attach={"attributes-position"} />
      </bufferGeometry>
    </points>
  );
}

type Color = { r: number, g: number, b: number, a: number };

type Parameters = {
  fontface?: string,
  fontsize?: number,
  borderThickness?: number,
  borderColor?: Color,
  backgroundColor?: Color,
}

export function TextSprite(
  { message, parameters, position }: { message: string, parameters?: Parameters, position?: [number, number, number] }
) {
  if (parameters === undefined) parameters = {};

  const texture = useMemo(() => {
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
  }, [message, parameters]);

  if (texture === null) return null;
  texture.needsUpdate = true;

  return (
    <sprite scale={[10, 5, 200.0]} onPointerDown={ev => ev.stopPropagation()} position={position}>
      <spriteMaterial map={texture} depthTest={true} transparent={true} />
    </sprite>
  );
}
