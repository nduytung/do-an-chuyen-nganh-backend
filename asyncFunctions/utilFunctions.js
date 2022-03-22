export const handleReturn = (res, status, message, success, ...props) => {
  return res.status(status).json({ message, success });
};

export const verifyFields = (req, res, props) => {
  const { ...props } = req.body;
  if (!{ ...props })
    return handleReturn(res, 403, "Bad request: Missing fields", false);
  return true;
};
