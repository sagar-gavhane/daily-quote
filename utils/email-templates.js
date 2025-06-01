export const generateQuoteEmailTemplate = (response) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Good Morning!</h2>
        <p>Here's your historical quote for the day:</p>
        <blockquote style="border-left: 4px solid #3498db; padding-left: 1em; margin-left: 0; font-style: italic; color: #555;">
          ${response.quote.trim()}
        </blockquote>
        <p style="text-align: right; color: #7f8c8d; font-style: italic;">— ${response.author.trim()}</p>

        <div style="background-color: #f9f9f9; padding: 1em; border-radius: 5px; margin: 1em 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">💡 Meaning</h3>
          <p style="margin-bottom: 0;">${response.meaning.trim()}</p>
        </div>

        <div style="background-color: #f5f6fa; padding: 1em; border-radius: 5px; margin: 1em 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">🎯 Real-World Analogy</h3>
          <p style="margin-bottom: 0;">${response.analogy.trim()}</p>
        </div>

        <p>Have a wonderful and inspiring day!</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 0.9em; color: #7f8c8d;">
            Automated message by your Vercel Daily Quote Bot.
        </p>
    </div>
  `;
};

export const generateBookEmailTemplate = (response, book) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a202c; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header Section -->
        <header style="text-align: center; margin-bottom: 2em;">
          <h1 style="color: #2d3748; font-size: 28px; margin: 0;">📚 Daily Book Summary</h1>
          <p style="color: #718096; font-size: 16px; margin-top: 0.5em;">Your daily dose of wisdom</p>
        </header>

        <!-- Book Title Card -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2em; border-radius: 12px; margin-bottom: 2em; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h1 style="font-size: 24px; margin: 0; font-weight: 600;">${response.title}</h1>
          <h2 style="font-size: 18px; margin: 0.5em 0; font-weight: 400; opacity: 0.9;">by ${response.author}</h2>
          <div style="font-size: 14px; margin-top: 1em; opacity: 0.8;">${book.genre} • ${book.yearPublished}</div>
        </div>

        <!-- Introduction Section -->
        <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
          <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">📖 Introduction</h2>
          <p style="color: #4a5568; line-height: 1.8;">${response.introduction}</p>
        </section>

        <!-- Topics Section -->
        ${response.topics
          .map(
            (topic) => `
          <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
            <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">
              📑 ${topic.title}
            </h2>

            <!-- Overview -->
            <div style="margin-bottom: 1.5em;">
              <h3 style="color: #4a5568; font-size: 18px; margin: 1em 0 0.5em;">Overview</h3>
              <p style="color: #4a5568; line-height: 1.8; margin: 0;">${topic.overview}</p>
            </div>

            <!-- Examples -->
            <div style="margin-bottom: 1.5em; background: #f7fafc; padding: 1em; border-radius: 6px;">
              <h3 style="color: #4a5568; font-size: 18px; margin: 0 0 0.5em;">Practical Examples</h3>
              <ul style="margin: 0; padding-left: 1.5em; color: #4a5568;">
                ${topic.examples
                  .map(
                    (example) => `
                  <li style="margin-bottom: 0.5em;">${example}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <!-- Key Takeaways -->
            <div style="background: #f7fafc; padding: 1em; border-radius: 6px;">
              <h3 style="color: #4a5568; font-size: 18px; margin: 0 0 0.5em;">Key Insights</h3>
              <ul style="margin: 0; padding-left: 1.5em; color: #4a5568;">
                ${topic.keyTakeaways
                  .map(
                    (takeaway) => `
                  <li style="margin-bottom: 0.5em;">${takeaway}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          </section>
        `
          )
          .join("")}

        <!-- Modern Application Section -->
        <section style="background: white; padding: 1.5em; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); margin-bottom: 2em;">
          <h2 style="color: #2d3748; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em;">🌟 Modern Application</h2>
          <p style="color: #4a5568; line-height: 1.8;">${response.modernApplication}</p>
        </section>

        <!-- Footer -->
        <footer style="text-align: center; margin-top: 3em; padding-top: 2em; border-top: 1px solid #e2e8f0;">
          <p style="color: #718096; font-size: 0.9em;">
            Daily Book Summary Bot • Crafted with 💜 for continuous learning
          </p>
          <p style="color: #718096; font-size: 0.8em;">
            To unsubscribe, reply with "STOP"
          </p>
        </footer>
      </div>
    </body>
    </html>
  `;
};
