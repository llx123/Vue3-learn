import { isObject } from "@vue/shared"
import { ReactiveFlags } from "./constants"
import { mutableHandlers, shallowReactiveHandlers } from "./baseHandlers"

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}
enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()

export function reactive(target: object) {
  return createReactiveObject(target, false, mutableHandlers, reactiveMap)
}

export function shallowReactive<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReactiveHandlers, shallowReactiveMap)
}

export function readonly<T extends object>(target: T) {
  return createReactiveObject(target, false, shallowReactiveHandlers, readonlyMap)
}

export function shallowReadonly() { }

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 检查目标是不是对象
  if (!isObject(target)) {
    return target
  }
  // 检查目标是否已经是Proxy
  // 例外情况：对响应式对象调用 readonly()
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // 目标对象是否已经有对应的proxy
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 如果是不能被观察的类型 如：函数、日期返回原始对象
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }

  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}

function getTargetType(value: Target) {
  return TargetType.INVALID
}
