const { buildActivityInsights } = require("./activityInsights");

function buildFallbackCategoryAdvice(insights) {
  return (insights.categoryProgress || [])
    .slice(0, 3)
    .map((item) => ({
      category: item.name,
      advice: item.averageProbability < 50
        ? `This category is under pressure. Reduce context switching and schedule one focused session for it today.`
        : `Maintain the current pace in this category and protect the routine that is already working.`,
    }));
}

function buildFallbackResponse(goals, insights) {
  const weakestGoal = insights.weakSpots.weakestGoals[0];
  const suggestions = [];

  if (insights.metrics.checkInsToday === 0 && insights.metrics.activeGoals > 0) {
    suggestions.push("Record at least one check-in today so the system has current data.");
  }

  if (insights.metrics.averageProgress < 50 && insights.metrics.activeGoals > 0) {
    suggestions.push("Push one active goal past the halfway mark before splitting focus again.");
  }

  if (weakestGoal) {
    suggestions.push(`${weakestGoal.title} needs ${weakestGoal.requiredDailyProgress || 0}% progress per day to finish on time.`);
  }

  if (insights.weakSpots.weakestCategory) {
    suggestions.push(`Your weakest category right now is ${insights.weakSpots.weakestCategory}.`);
  }

  const soonestGoal = goals
    .filter((goal) => !goal.completed && goal.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];

  if (soonestGoal) {
    suggestions.push(`Prioritize ${soonestGoal.title} because it has the nearest deadline.`);
  }

  if (!suggestions.length) {
    suggestions.push("Your board is balanced. Keep daily updates consistent to preserve momentum.");
  }

  return {
    provider: "deterministic-fallback",
    summary: [
      `You are tracking ${insights.metrics.totalGoals} goal${insights.metrics.totalGoals === 1 ? "" : "s"}.`,
      `${insights.metrics.completedGoals} are complete and ${insights.metrics.activeGoals} are still active.`,
      weakestGoal
        ? `${weakestGoal.title} is currently the weakest goal with ${weakestGoal.completionProbability}% completion probability and ${weakestGoal.daysLeft ?? "no"} days left.`
        : "No single weak goal stands out yet.",
    ].join(" "),
    focusAreas: goals
      .filter((goal) => !goal.completed)
      .sort((a, b) => (a.progress || 0) - (b.progress || 0))
      .slice(0, 3)
      .map((goal) => goal.title),
    suggestions: suggestions.slice(0, 5),
    categoryAdvice: buildFallbackCategoryAdvice(insights),
  };
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function generateAiSummary(goals, entries) {
  const insights = buildActivityInsights(goals, entries);
  const fallback = buildFallbackResponse(goals, insights);
  const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
  const apiUrl = process.env.GROQ_API_URL || process.env.LLM_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  const model = process.env.GROQ_MODEL || process.env.LLM_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    return {
      ...fallback,
      feedback: fallback.suggestions,
    };
  }

  const payload = {
    model,
    temperature: 0.4,
    max_tokens: 650,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: 'You are a productivity coach. Analyze user data and provide actionable feedback. Reply in JSON with keys summary, focusAreas, suggestions, categoryAdvice. summary should be concise and specific. focusAreas is an array of goal titles. suggestions is an array of actionable bullets. categoryAdvice is an array of objects with keys category and advice.',
      },
      {
        role: "user",
        content: JSON.stringify({
          metrics: insights.metrics,
          weeklyComparison: insights.weeklyComparison,
          weakSpots: insights.weakSpots,
          categoryProgress: insights.categoryProgress,
          goalIntelligence: insights.goalIntelligence,
          notifications: insights.notifications,
          recentProgress: insights.progressTrend,
        }),
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed with ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = content ? safeJsonParse(content) : null;

    if (!parsed?.summary) {
      throw new Error("LLM response did not contain valid JSON");
    }

    return {
      provider: `groq:${model}`,
      summary: parsed.summary,
      focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : fallback.focusAreas,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : fallback.suggestions,
      categoryAdvice: Array.isArray(parsed.categoryAdvice) ? parsed.categoryAdvice : fallback.categoryAdvice,
      feedback: Array.isArray(parsed.suggestions) ? parsed.suggestions : fallback.suggestions,
    };
  } catch (error) {
    console.error("AI summary fallback:", error.message);
    return {
      ...fallback,
      feedback: fallback.suggestions,
    };
  }
}

module.exports = {
  generateAiSummary,
};
