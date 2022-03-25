const handleReturn = (
  res,
  status,
  message,
  success = false,
  props = "No params"
) => {
  return res.status(status).json({ message, success, props });
};

module.exports = { handleReturn };
