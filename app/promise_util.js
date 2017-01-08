const Promise = global.Promise;

function assertAllArgsFunctions(args) {
  for (var i = 0; i < args.length; i++) {
    if (typeof args[i] !== 'function') {
      throw new Error('all arguments must be functions!');
    }
  }
}

class PromiseUtil {
  inSeries() {
    var args = Array.from(arguments);
    assertAllArgsFunctions(args);

    var initialValue = Promise.resolve();

    // chain all the methods on each other
    return args.reduce((reducedValue, fn) => {
      return reducedValue = reducedValue.then(fn);
    }, initialValue);
  }
}

module.exports = PromiseUtil;
