const handleReturn = (res, status, message, success, props = "No params") => {
  return res.status(status).json({ message, success, props });
};

module.exports = { handleReturn };
