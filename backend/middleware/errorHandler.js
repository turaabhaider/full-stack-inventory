export const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal architectural fault detected. Please try again.' 
  });
};