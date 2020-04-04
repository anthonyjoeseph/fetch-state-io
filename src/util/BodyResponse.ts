export type BodyResponse = {
  readonly type: "arrayBuffer";
  readonly value0: ArrayBuffer;
} | {
  readonly type: "blob";
  readonly value0: Blob;
} | {
  readonly type: "formData";
  readonly value0: FormData;
} | {
  readonly type: "text";
  readonly value0: string;
};

export function arrayBuffer(value0: ArrayBuffer): BodyResponse { return { type: "arrayBuffer", value0 }; }

export function blob(value0: Blob): BodyResponse { return { type: "blob", value0 }; }

export function formData(value0: FormData): BodyResponse { return { type: "formData", value0 }; }

export function text(value0: string): BodyResponse { return { type: "text", value0 }; }

export function fold<R>(onarrayBuffer: (value0: ArrayBuffer) => R, onblob: (value0: Blob) => R, onformData: (value0: FormData) => R, ontext: (value0: string) => R): (fa: BodyResponse) => R { return fa => { switch (fa.type) {
  case "arrayBuffer": return onarrayBuffer(fa.value0);
  case "blob": return onblob(fa.value0);
  case "formData": return onformData(fa.value0);
  case "text": return ontext(fa.value0);
} }; }

import { Prism } from "monocle-ts";

export const _arrayBuffer: Prism<BodyResponse, BodyResponse> = Prism.fromPredicate(s => s.type === "arrayBuffer");

export const _blob: Prism<BodyResponse, BodyResponse> = Prism.fromPredicate(s => s.type === "blob");

export const _formData: Prism<BodyResponse, BodyResponse> = Prism.fromPredicate(s => s.type === "formData");

export const _text: Prism<BodyResponse, BodyResponse> = Prism.fromPredicate(s => s.type === "text");

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export function getEq(eqarrayBufferValue0: Eq<ArrayBuffer>, eqblobValue0: Eq<Blob>, eqformDataValue0: Eq<FormData>, eqtextValue0: Eq<string>): Eq<BodyResponse> { return fromEquals((x, y) => { if (x.type === "arrayBuffer" && y.type === "arrayBuffer") {
  return eqarrayBufferValue0.equals(x.value0, y.value0);
} if (x.type === "blob" && y.type === "blob") {
  return eqblobValue0.equals(x.value0, y.value0);
} if (x.type === "formData" && y.type === "formData") {
  return eqformDataValue0.equals(x.value0, y.value0);
} if (x.type === "text" && y.type === "text") {
  return eqtextValue0.equals(x.value0, y.value0);
} return false; }); }