

export enum ReactiveFlags {
  SKIP = '__v_skip', // 标记跳过追踪和处理
  IS_REACTIVE = '__v_isReactive', // 标记一个对象是否是响应式
  IS_READONLY = '__v_isReadonly', // 标记一个对象是否是只读
  IS_SHALLOW = '__v_isShallow', // 标记一个响应式对象是否是浅层
  RAW = '__v_raw', // 用于存储原始的非响应式对象
} 