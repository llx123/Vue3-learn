import { isObject, toRawType } from "@vue/shared"
import { ReactiveFlags } from "./constants"
import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers } from "./baseHandlers"

declare const RefSymbol: unique symbol
declare const RawSymbol: unique symbol
export interface Ref<T = any> {
  value: T,
  [RefSymbol]: true
}
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
  return createReactiveObject(target, true, readonlyHandlers, readonlyMap)
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

export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW])
}

export function toRaw<T>(observed: T): T {
  // 如果为真，它会递归地调用 toRaw(raw)，以确保返回的是最原始的对象
  // （因为在某些情况下，raw 可能还是一个被包装的响应式对象）。
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}


export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return !!(r && r.__v__isRef === true)
}

function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

// 标记跳过或不可扩展
function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID : targetTypeMap(toRawType(value))
}
