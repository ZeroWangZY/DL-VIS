export function wrapTaskWithTimeLogger(task) {
  const resFunc = async function(...args){
    let start = Date.now();
    let result = await task.call(this, ...args);
    console.log(task.name, ':', Date.now() - start, 'ms');
    return result;
  };
  return resFunc;
}