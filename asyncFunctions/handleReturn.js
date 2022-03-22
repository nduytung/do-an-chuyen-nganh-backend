export default handleReturn = (res, status, message, success, ...props) => {
  return res.status(status).json({ message, success });
};
