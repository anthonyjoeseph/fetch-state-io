export type BodyRequest = {
  readonly type: "arrayBuffer";
} | {
  readonly type: "blob";
} | {
  readonly type: "formData";
} | {
  readonly type: "text";
};

export const arrayBuffer: BodyRequest = { type: "arrayBuffer" };

export const blob: BodyRequest = { type: "blob" };

export const formData: BodyRequest = { type: "formData" };

export const text: BodyRequest = { type: "text" };

export function fold<R>(onarrayBuffer: () => R, onblob: () => R, onformData: () => R, ontext: () => R): (fa: BodyRequest) => R { return fa => { switch (fa.type) {
  case "arrayBuffer": return onarrayBuffer();
  case "blob": return onblob();
  case "formData": return onformData();
  case "text": return ontext();
} }; }

import { Prism } from "monocle-ts";

export const _arrayBuffer: Prism<BodyRequest, BodyRequest> = Prism.fromPredicate(s => s.type === "arrayBuffer");

export const _blob: Prism<BodyRequest, BodyRequest> = Prism.fromPredicate(s => s.type === "blob");

export const _formData: Prism<BodyRequest, BodyRequest> = Prism.fromPredicate(s => s.type === "formData");

export const _text: Prism<BodyRequest, BodyRequest> = Prism.fromPredicate(s => s.type === "text");

import { Eq, fromEquals } from "fp-ts/lib/Eq";

export function getEq(): Eq<BodyRequest> { return fromEquals((x, y) => { if (x.type === "arrayBuffer" && y.type === "arrayBuffer") {
  return true;
} if (x.type === "blob" && y.type === "blob") {
  return true;
} if (x.type === "formData" && y.type === "formData") {
  return true;
} if (x.type === "text" && y.type === "text") {
  return true;
} return false; }); }