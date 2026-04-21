const MOOD_ORDER = ["happy", "neutral", "sad", "frustrated"];

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getDateOffsetString(offset) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(start, end) {
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000));
}

function computeStreak(entries) {
  const uniqueDays = [...new Set(entries.map((entry) => entry.date))]
    .sort((a, b) => b.localeCompare(a));

  if (!uniqueDays.length) {
    return 0;
  }

  const today = getTodayDateString();
  const yesterday = getDateOffsetString(-1);
  const firstDay = uniqueDays[0];

  if (firstDay !== today && firstDay !== yesterday) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(`${firstDay}T00:00:00Z`);

  for (let index = 1; index < uniqueDays.length; index += 1) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const expected = cursor.toISOString().slice(0, 10);
    if (uniqueDays[index] !== expected) {
      break;
    }
    streak += 1;
  }

  return streak;
}

function buildProgressTrend(entries, days = 14) {
  const recentEntries = entries
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days * 3);

  const perDay = new Map();

  recentEntries.forEach((entry) => {
    const current = perDay.get(entry.date) || { totalProgress: 0, count: 0, completed: 0 };
    current.totalProgress += entry.progress || 0;
    current.count += 1;
    current.completed += entry.completed ? 1 : 0;
    perDay.set(entry.date, current);
  });

  return [...perDay.entries()]
    .slice(-days)
    .map(([date, metrics]) => ({
      date,
      label: formatDayLabel(date),
      averageProgress: metrics.count ? Math.round(metrics.totalProgress / metrics.count) : 0,
      completedCheckIns: metrics.completed,
      totalCheckIns: metrics.count,
    }));
}

function buildMoodBreakdown(entries) {
  const counters = new Map(MOOD_ORDER.map((mood) => [mood, 0]));

  entries.forEach((entry) => {
    if (entry.mood && counters.has(entry.mood)) {
      counters.set(entry.mood, counters.get(entry.mood) + 1);
    }
  });

  return [...counters.entries()]
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

function buildWeeklyWindow(entries, startOffset, endOffset) {
  const start = getDateOffsetString(startOffset);
  const end = getDateOffsetString(endOffset);
  return entries.filter((entry) => entry.date >= start && entry.date <= end);
}

function buildWeeklyComparison(entries) {
  const thisWeekEntries = buildWeeklyWindow(entries, -6, 0);
  const lastWeekEntries = buildWeeklyWindow(entries, -13, -7);
  const thisWeekCompleted = thisWeekEntries.filter((entry) => entry.completed).length;
  const lastWeekCompleted = lastWeekEntries.filter((entry) => entry.completed).length;
  const delta = thisWeekCompleted - lastWeekCompleted;
  const deltaPercent = lastWeekCompleted > 0
    ? Math.round((delta / lastWeekCompleted) * 100)
    : thisWeekCompleted > 0
      ? 100
      : 0;
  const completionRate = thisWeekEntries.length
    ? Math.round((thisWeekCompleted / thisWeekEntries.length) * 100)
    : 0;

  return {
    thisWeekCompleted,
    lastWeekCompleted,
    delta,
    deltaPercent,
    completionRate,
    thisWeekTotal: thisWeekEntries.length,
  };
}

function buildGoalIntelligence(goals, entries) {
  const today = new Date(`${getTodayDateString()}T00:00:00Z`);

  return goals.map((goal) => {
    const goalEntries = entries
      .filter((entry) => String(entry.goalId) === String(goal._id))
      .sort((a, b) => a.date.localeCompare(b.date));

    const recentEntries = goalEntries.slice(-7);
    const recentDates = [...new Set(recentEntries.map((entry) => entry.date))];
    const recentAverageProgress = recentEntries.length
      ? recentEntries.reduce((sum, entry) => sum + (entry.progress || 0), 0) / recentEntries.length
      : goal.progress || 0;
    const consistencyScore = Math.round((recentDates.length / 7) * 100);

    const lastEntry = goalEntries[goalEntries.length - 1];
    const completionGap = Math.max(0, 100 - (goal.progress || 0));
    const endDate = goal.endDate ? new Date(goal.endDate) : null;
    const daysLeft = endDate ? daysBetween(today, endDate) : null;
    const requiredDailyProgress = daysLeft && completionGap > 0
      ? Number((completionGap / Math.max(daysLeft, 1)).toFixed(1))
      : 0;

    const paceFactor = completionGap === 0
      ? 1
      : recentAverageProgress > 0
        ? recentAverageProgress / Math.max(requiredDailyProgress || 1, 1)
        : 0;
    const goalStreak = computeStreak(goalEntries);
    const progressRate = Number((recentAverageProgress / 100).toFixed(3));
    const completionRate = Number(((goal.progress || 0) / 100).toFixed(3));

    let completionProbability = goal.completed ? 100 : 55;

    if (daysLeft !== null) {
      completionProbability = clamp(
        Math.round(
          (goal.progress || 0) * 0.45 +
          clamp(paceFactor, 0, 1.6) * 30 +
          (daysLeft > 7 ? 18 : daysLeft > 3 ? 10 : 2)
        ),
        5,
        100
      );
    }

    const status = goal.completed
      ? "completed"
      : daysLeft === null
        ? "active"
        : daysLeft < 0
          ? "overdue"
          : completionProbability >= 75
            ? "on-track"
            : completionProbability >= 45
              ? "at-risk"
              : "critical";

    return {
      goalId: goal._id,
      title: goal.title,
      category: goal.category || "General",
      priority: goal.priority || "medium",
      progress: goal.progress || 0,
      daysLeft,
      deadline: goal.endDate,
      completionGap,
      requiredDailyProgress,
      recentAverageProgress: Math.round(recentAverageProgress),
      progressRate,
      completionRate,
      goalStreak,
      consistencyScore,
      completionProbability,
      status,
      checkedInToday: lastEntry?.date === getTodayDateString(),
      weakReason: goal.completed
        ? "Completed."
        : daysLeft === null
          ? "No deadline set yet."
          : daysLeft < 0
            ? "Deadline already passed."
            : requiredDailyProgress > 12
              ? `Needs ${requiredDailyProgress}% progress per day to finish on time.`
              : completionProbability < 50
                ? "Current pace is below what the deadline requires."
                : "Pace is currently acceptable.",
    };
  }).sort((a, b) => a.completionProbability - b.completionProbability);
}

function buildCategoryProgress(goals, entries, goalIntelligence) {
  const thisWeekEntries = buildWeeklyWindow(entries, -6, 0);
  const entriesByGoal = new Map();

  thisWeekEntries.forEach((entry) => {
    const key = String(entry.goalId);
    entriesByGoal.set(key, (entriesByGoal.get(key) || 0) + (entry.completed ? 1 : 0));
  });

  const categoryMap = new Map();

  goals.forEach((goal) => {
    const category = goal.category || "General";
    const current = categoryMap.get(category) || { name: category, completed: 0, total: 0, probabilityTotal: 0 };
    current.total += 1;
    current.completed += entriesByGoal.get(String(goal._id)) || 0;
    current.probabilityTotal += goalIntelligence.find((item) => String(item.goalId) === String(goal._id))?.completionProbability || 0;
    categoryMap.set(category, current);
  });

  return [...categoryMap.values()]
    .map((item) => ({
      ...item,
      ratioLabel: `${item.completed}/${item.total}`,
      percent: item.total ? Math.min(100, Math.round((item.completed / item.total) * 100)) : 0,
      averageProbability: item.total ? Math.round(item.probabilityTotal / item.total) : 0,
    }))
    .sort((a, b) => a.percent - b.percent || a.averageProbability - b.averageProbability)
    .slice(0, 4);
}

function buildWeakSpots(goalIntelligence, categoryProgress) {
  const weakestGoals = goalIntelligence
    .filter((goal) => !["completed", "active"].includes(goal.status))
    .slice(0, 3);

  const weakestCategory = categoryProgress[0]?.name || null;

  return {
    weakestGoals,
    weakestCategory,
  };
}

function buildNotifications(goals, entries, streak, goalIntelligence) {
  const today = getTodayDateString();
  const todayGoalIds = new Set(
    entries
      .filter((entry) => entry.date === today)
      .map((entry) => String(entry.goalId))
  );
  const notifications = [];

  if (goals.some((goal) => !goal.completed) && todayGoalIds.size === 0) {
    notifications.push({
      id: "daily-checkin",
      type: "reminder",
      title: "Daily streak reminder",
      body: streak > 0
        ? `You have a ${streak}-day streak. Record a check-in today to keep it alive.`
        : "You have not checked in today yet. Record one update to start your streak.",
    });
  }

  goalIntelligence.slice(0, 4).forEach((item) => {
    if (item.status === "critical" || item.status === "overdue") {
      notifications.push({
        id: `risk-${item.goalId}`,
        type: "risk",
        title: `${item.title} needs attention`,
        body: item.weakReason,
      });
    } else if (item.daysLeft !== null && item.daysLeft <= 3 && item.status !== "completed") {
      notifications.push({
        id: `deadline-${item.goalId}`,
        type: "deadline",
        title: `${item.title} is due soon`,
        body: item.daysLeft === 0
          ? "Deadline is today."
          : `${item.daysLeft} day${item.daysLeft === 1 ? "" : "s"} left to finish this goal.`,
      });
    } else if (!todayGoalIds.has(String(item.goalId)) && item.status !== "completed") {
      notifications.push({
        id: `goal-reminder-${item.goalId}`,
        type: "nudge",
        title: `No update yet for ${item.title}`,
        body: "Add a quick check-in so your dashboard stays current.",
      });
    }
  });

  return notifications.slice(0, 5);
}

function buildActivityInsights(goals, entries) {
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const activeGoals = goals.length - completedGoals;
  const averageProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length)
    : 0;
  const completionRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;
  const streak = computeStreak(entries);
  const progressTrend = buildProgressTrend(entries);
  const moodBreakdown = buildMoodBreakdown(entries);
  const weeklyComparison = buildWeeklyComparison(entries);
  const goalIntelligence = buildGoalIntelligence(goals, entries);
  const categoryProgress = buildCategoryProgress(goals, entries, goalIntelligence);
  const weakSpots = buildWeakSpots(goalIntelligence, categoryProgress);
  const notifications = buildNotifications(goals, entries, streak, goalIntelligence);

  return {
    metrics: {
      totalGoals: goals.length,
      completedGoals,
      activeGoals,
      averageProgress,
      completionRate,
      totalCheckIns: entries.length,
      checkInsToday: entries.filter((entry) => entry.date === getTodayDateString()).length,
      streak,
    },
    completionBreakdown: [
      { name: "Completed", value: completedGoals },
      { name: "Active", value: activeGoals },
    ],
    progressTrend,
    moodBreakdown,
    notifications,
    weeklyComparison,
    categoryProgress,
    goalIntelligence,
    weakSpots,
  };
}

module.exports = {
  buildActivityInsights,
  buildGoalIntelligence,
  getTodayDateString,
};
