
import { ReactiveFlags } from "./constants"
import { type Target, reactiveMap, shallowReactiveMap, readonlyMap, shallowReadonlyMap } from "./reactive"
export const mutableHandlers: ProxyHandler<object> = new MutableReactiveHandler()
export const shallowReactiveHandlers = {}
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
  }
}

class MutableReactiveHandler extends BaseReactiveHandler {

}