export const fetchRandomQuote = async () => {
  const quotes = await fetch("https://api.api-ninjas.com/v1/quotes", {
    method: "GET",
    headers: {
      "X-Api-Key": process.env.API_NINJAS_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!quotes.ok) {
    throw new Error(`Failed to fetch quotes: ${quotes.statusText}`);
  }

  const quotesData = await quotes.json();
  const quote = quotesData.at(0);
  console.log("quote fetched successfully:", quote);
  
  return quote;
};
