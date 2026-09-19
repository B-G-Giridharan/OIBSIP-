function notFound(_req, res) {
  res.status(404).json({ message: "The requested resource was not found." });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  const message =
    status >= 500
      ? "Something went wrong while processing your request. Please try again."
      : err.message || "Request could not be completed.";
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
