import { isObject } from "@vue/shared"
import { ReactiveFlags } from "./constants"
import { mutableHandlers, shallowReactiveHandlers } from "./baseHandlers"

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: boolean
}

export function reactive(target: object) {
  return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function shallowReadonly() { }

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    return target
  }
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }

  const proxy = new Proxy(target, baseHandlers)
  return proxy
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
