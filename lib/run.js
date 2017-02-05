'use strict';

const format = (time) => {
  return time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
};

function run(fn: any, options: ?any) {
  const task = fn.default || fn;
  const start = new Date();

  console.log(`[${format(start)}] Starting '${task.name}'...`);

  return task(options).then(() => {

    const end = new Date();
    const elapsedTime = end.getTime() - start.getTime();

    console.log(`[${format(end)}] Finished '${task.name}' after ${elapsedTime} ms`);
  }).catch((err) => {

    const end = new Date();
    const elapsedTime = end.getTime() - start.getTime();

    console.error(`[${format(end)}] Error '${task.name}' after ${elapsedTime} ms: ${err}`);
    console.error(err.stack);
  });
}

export default run;
