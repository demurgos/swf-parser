import { ReadableByteStream } from "@open-flash/stream";
import { Uint2, Uint4, Uint8 } from "semantic-types";
import { ColorSpace } from "swf-types/lib/color-space.js";
import { ColorStop } from "swf-types/lib/color-stop.js";
import { GradientSpread } from "swf-types/lib/gradient-spread.js";
import { Gradient } from "swf-types/lib/gradient.js";
import { MorphColorStop } from "swf-types/lib/morph-color-stop.js";
import { MorphGradient } from "swf-types/lib/morph-gradient.js";
import { StraightSRgba8 } from "swf-types/lib/straight-s-rgba8.js";

import { parseSRgb8, parseStraightSRgba8 } from "./basic-data-types.js";

export function parseColorStop(byteStream: ReadableByteStream, withAlpha: boolean): ColorStop {
  const ratio: Uint8 = byteStream.readUint8();
  let color: StraightSRgba8;
  if (withAlpha) {
    color = parseStraightSRgba8(byteStream);
  } else {
    color = {...parseSRgb8(byteStream), a: 255};
  }
  return {ratio, color};
}

export function parseGradient(byteStream: ReadableByteStream, withAlpha: boolean): Gradient {
  const flags: Uint8 = byteStream.readUint8();
  // The spec says that spreadId and colorSpaceId should be ignored for shapeVersion < Shape4
  // and color count should be capped at 8. We're ignoring it for the moment.
  const spreadId: Uint2 = <Uint2> ((flags & ((1 << 8) - 1)) >>> 6);
  const colorSpaceId: Uint2 = <Uint2> ((flags & ((1 << 6) - 1)) >>> 4);
  const colorCount: Uint4 = <Uint4> (flags & ((1 << 4) - 1));
  let spread: GradientSpread;
  switch (spreadId) {
    case 0:
      spread = GradientSpread.Pad;
      break;
    case 1:
      spread = GradientSpread.Reflect;
      break;
    case 2:
      spread = GradientSpread.Repeat;
      break;
    default:
      throw new Error("Unexpected gradient spread");
  }
  let colorSpace: ColorSpace;
  switch (colorSpaceId) {
    case 0:
      colorSpace = ColorSpace.SRgb;
      break;
    case 1:
      colorSpace = ColorSpace.LinearRgb;
      break;
    default:
      throw new Error("Unexpected gradient spread");
  }
  const colors: ColorStop[] = [];
  for (let i: number = 0; i < colorCount; i++) {
    colors.push(parseColorStop(byteStream, withAlpha));
  }
  return {
    spread,
    colorSpace,
    colors,
  };
}

export function parseMorphColorStop(byteStream: ReadableByteStream, withAlpha: boolean): MorphColorStop {
  const {ratio, color} = parseColorStop(byteStream, withAlpha);
  const {ratio: morphRatio, color: morphColor} = parseColorStop(byteStream, withAlpha);
  return {ratio, color, morphRatio, morphColor};
}

export function parseMorphGradient(byteStream: ReadableByteStream, withAlpha: boolean): MorphGradient {
  const flags: Uint8 = byteStream.readUint8();
  const spreadId: Uint2 = <Uint2> ((flags & ((1 << 8) - 1)) >>> 6);
  const colorSpaceId: Uint2 = <Uint2> ((flags & ((1 << 6) - 1)) >>> 4);
  const colorCount: Uint4 = <Uint4> (flags & ((1 << 4) - 1));
  let spread: GradientSpread;
  switch (spreadId) {
    case 0:
      spread = GradientSpread.Pad;
      break;
    case 1:
      spread = GradientSpread.Reflect;
      break;
    case 2:
      spread = GradientSpread.Repeat;
      break;
    default:
      throw new Error("Unexpected gradient spread");
  }
  let colorSpace: ColorSpace;
  switch (colorSpaceId) {
    case 0:
      colorSpace = ColorSpace.SRgb;
      break;
    case 1:
      colorSpace = ColorSpace.LinearRgb;
      break;
    default:
      throw new Error("Unexpected gradient spread");
  }
  const colors: MorphColorStop[] = [];
  for (let i: number = 0; i < colorCount; i++) {
    colors.push(parseMorphColorStop(byteStream, withAlpha));
  }
  return {
    spread,
    colorSpace,
    colors,
  };
}
