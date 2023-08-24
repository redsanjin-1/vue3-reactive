// 定义一个副作用函数桶
const bucket = new WeakMap(); // 修改 [target: Map[name: Set(fn, fn), age: Set(fn, fn)]]

// 定义一个全局变量，保存当前正在执行的副作用函数
let activeEffect;

function isObject(value) {
  return typeof value === "object" && value !== null;
}

// 收集依赖
function trace(target, key) {
  if (!activeEffect) return;

  let depMap = bucket.get(target);
  if (!depMap) {
    depMap = new Map();
    bucket.set(target, depMap);
  }
  let depSet = depMap.get(key);
  if (!depSet) {
    depSet = new Set();
    depMap.set(key, depSet);
  }

  depSet.add(activeEffect);
}

// 触发副作用函数
function trigger(target, key) {
  let depMap = bucket.get(target);

  if (!depMap) return;

  let depSet = depMap.get(key);
  if (depSet) {
    depSet.forEach((effect) => effect());
  }
}

// 创建响应式对象
function reactive(data) {
  if (!isObject(data)) return;

  return new Proxy(data, {
    get(target, key) {
      // 收集依赖
      trace(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      // 触发副作用函数
      trigger(target, key);
      return true;
    },
  });
}

// 注册副作用函数
function effect(fn) {
  if (typeof fn !== "function") return;

  // 保存副作用函数到全局变量中
  activeEffect = fn;
  // 执行副作用函数
  fn();
  // 重置全局变量
  activeEffect = null;
}
