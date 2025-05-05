export const catchAsyncErrors = (theFunction) => {
    return (req, res, next) => {
      // Wrap theFunction’s result in Promise.resolve()
      // so even if theFunction returns a non‐promise, it still works.
      Promise
        .resolve(theFunction(req, res, next))
        .catch(next);
    };
  };
  