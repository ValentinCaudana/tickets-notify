export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid data',
      details: result.error.issues.map(i => ({ path: i.path, message: i.message })),
    });
  }
  req.body = result.data;
  next();
};
