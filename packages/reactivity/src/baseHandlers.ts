
import { ReactiveFlags } from "./constants"
import {
  type Target,
  reactiveMap,
  shallowReactiveMap,
  readonlyMap,
  shallowReadonlyMap,
  readonly,
  reactive,
  isReadonly,
  isShallow,
  toRaw,
  isRef,
} from "./reactive"
import { hasOwn, isArray, isObject } from "@vue/shared"

class BaseReactiveHandler implements ProxyHandler<Target> {
  constructor(
    protected readonly _isReadonly = false,
    protected readonly _isShallow = false
  ) { }

  get(target: Target, key: string | symbol, receiver: object) {
    const isReadonly = this._isReadonly, isShallow = this._isShallow
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.RAW) {
      if (receiver === (
        isReadonly
          ?
          isShallow ? shallowReadonlyMap : readonlyMap
          :
          isShallow ? shallowReactiveMap : reactiveMap
      ).get(target)
        || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)
      ) {
        return target
      }
      return
    }

    const targetIsArray = isArray(target)

    if (!isReadonly) {
      if (targetIsArray) {
        // 数组的依赖收集
      }
    }

    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) { // 依赖收集

    }

    if (isShallow) {
      return res
    }
    if (isObject(res)) {
      // 懒代理 使用时才引用
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow = false) {
    super(false, isShallow)
  }
  set(target: object, key: string | symbol, value: unknown, receiver: object): boolean {
    let oldValue = (target as any)[key]
    // 不是浅层
    if (!this._isShallow) {
      // 判断oldValue是否是只读
      const isOldValueReadonly = isReadonly(oldValue)
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue)
        value = toRaw(value)
      }
      // 原始数据不是数组 且 是一个ref
      // 新的数据不能是一个ref因为oldValue.value期望的是一个原始值或对象
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false
        } else {
          // why? 不破坏原有响应式系统的追踪
          oldValue.value = value
          return true
        }
      }
    }
    const result = Reflect.set(target, key, value, receiver)
    return result
  }
}

class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow = false) {
    super(true, isShallow)
  }

  set(target: object, key: string | symbol) {
    console.warn(`${String(key)} is readonly`)
    return true
  }
}

export const mutableHandlers: ProxyHandler<object> = new MutableReactiveHandler()
export const readonlyHandlers: ProxyHandler<object> = new ReadonlyReactiveHandler()
export const shallowReactiveHandlers = {}