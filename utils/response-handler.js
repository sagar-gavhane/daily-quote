export const handleApiError = (error, errorType) => {
  console.error("Error processing request:", error);
  const errorMessage = error.message || "An internal server error occurred.";
  const errorStack = error.stack;

  return {
    status: 500,
    body: {
      error: `Failed to send ${errorType}`,
      details: errorMessage,
      stack: errorStack,
    },
  };
};

export const handleMethodNotAllowed = (method) => {
  return {
    status: 405,
    headers: { Allow: ["POST", "GET"] },
    body: `Method ${method} Not Allowed`,
  };
};
