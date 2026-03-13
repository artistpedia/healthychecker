document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    initializeTheme(themeToggleBtn);

    calculateBtn.addEventListener('click', () => {
        // --- 1. GET USER INPUTS ---
        const mealType = document.getElementById('meal-type').value;
        const veggieIntake = document.getElementById('veggie-intake').value;
        const proteinIntake = document.getElementById('protein-intake').value;
        const waterIntake = parseFloat(document.getElementById('water-intake').value) || 0;
        const sweetsIntake = parseFloat(document.getElementById('sweets-intake').value) || 0;

        const exerciseType = document.getElementById('exercise-type').value;
        const exerciseDuration = parseFloat(document.getElementById('exercise-duration').value) || 0;
        const stepCount = parseFloat(document.getElementById('step-count').value) || 0;
        const exerciseIntensity = document.getElementById('exercise-intensity').value;

        const sleepDuration = parseFloat(document.getElementById('sleep-duration').value) || 0;
        const targetScore = parseFloat(document.getElementById('target-score').value) || 85;

        // --- 2. CALCULATE SCORES ---
        const foodScore = calculateFoodScore(mealType, veggieIntake, proteinIntake, waterIntake, sweetsIntake);
        const exerciseScore = calculateExerciseScore(exerciseType, exerciseDuration, stepCount, exerciseIntensity);
        const sleepScore = calculateSleepScore(sleepDuration);
        
        const totalScore = Math.min(100, Math.round(foodScore + exerciseScore + sleepScore));
        const grade = getGrade(totalScore);

        // --- 3. UPDATE UI ---
        updateScoreDisplay(totalScore, grade, foodScore, exerciseScore, sleepScore);
        updateFeedback(totalScore);
        updateQuest(totalScore, targetScore, exerciseType);
    });

    themeToggleBtn.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, themeToggleBtn);
        localStorage.setItem('healthychecker-theme', nextTheme);
    });
});

function initializeTheme(themeToggleBtn) {
    const savedTheme = localStorage.getItem('healthychecker-theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(savedTheme || preferredTheme, themeToggleBtn);
}

function applyTheme(theme, themeToggleBtn) {
    const isDark = theme === 'dark';
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    document.body.dataset.theme = isDark ? 'dark' : 'light';
    themeToggleBtn.textContent = isDark ? '화이트모드' : '다크모드';
    themeToggleBtn.setAttribute('aria-label', isDark ? '화이트모드로 전환' : '다크모드로 전환');

    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#111827' : '#f4f7f6');
    }
}

/**
 * Calculates the food score (Max 50 points)
 */
function calculateFoodScore(mealType, veggieIntake, proteinIntake, waterIntake, sweetsIntake) {
    let score = 0;

    // Meal Type (Max 20)
    const mealScores = { 'balanced': 20, 'protein': 18, 'light': 15, 'mixed': 10, 'fastfood': 2 };
    score += mealScores[mealType] || 10;

    // Veggie Intake (Max 10)
    const veggieScores = { 'high': 10, 'medium': 6, 'low': 2 };
    score += veggieScores[veggieIntake] || 0;

    // Protein Intake (Max 10)
    const proteinScores = { 'high': 10, 'medium': 6, 'low': 2 };
    score += proteinScores[proteinIntake] || 0;

    // Water Intake (Max 5)
    score += Math.min(5, waterIntake / 2);

    // Sweets/Drinks (Deduction, Max -5)
    score -= Math.min(5, sweetsIntake * 2);
    
    return Math.max(0, score);
}

/**
 * Calculates the exercise score (Max 35 points)
 */
function calculateExerciseScore(type, duration, steps, intensity) {
    if (type === 'none') return 0;
    
    let score = 0;
    const intensityMultipliers = { 'low': 0.8, 'medium': 1.0, 'high': 1.2 };
    const typeMultipliers = { 'walking': 1, 'running': 1.5, 'cycling': 1.2, 'strength': 1.4, 'yoga': 0.9, 'sports': 1.6 };

    let baseScore = (duration / 30) * 15; // 30 min of exercise is a good base
    baseScore += (steps / 5000) * 10; // 5000 steps is a good base

    score = baseScore * (typeMultipliers[type] || 1) * (intensityMultipliers[intensity] || 1);
    
    return Math.min(35, score);
}

/**
 * Calculates the sleep score (Max 15 points)
 */
function calculateSleepScore(duration) {
    if (duration >= 7 && duration <= 8.5) {
        return 15;
    } else if (duration >= 6 && duration < 9.5) {
        return 10;
    } else if (duration >= 5 && duration < 10.5) {
        return 5;
    } else {
        return 0;
    }
}

/**
 * Gets the grade based on the total score.
 */
function getGrade(score) {
    if (score >= 95) return 'S';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    return 'D';
}

/**
 * Updates the score display UI.
 */
function updateScoreDisplay(total, grade, food, exercise, sleep) {
    document.querySelector('.score').textContent = total;
    document.querySelector('.grade').textContent = grade;
    document.getElementById('score-details').innerHTML = 
        `<p>식사: ${Math.round(food)} | 운동: ${Math.round(exercise)} | 수면: ${Math.round(sleep)}</p>`;
}

/**
 * Updates the feedback message.
 */
function updateFeedback(score) {
    let message = "";
    if (score >= 95) message = "매우 훌륭합니다. 오늘은 건강 관리가 거의 완벽하게 이루어졌어요.";
    else if (score >= 85) message = "좋습니다. 전반적으로 균형 잡힌 건강 습관을 잘 유지하고 있어요.";
    else if (score >= 70) message = "괜찮은 흐름입니다. 한두 가지 습관만 보완하면 더 좋아질 수 있어요.";
    else if (score >= 50) message = "기본은 갖췄습니다. 아래 가이드를 참고해 점수를 더 끌어올려보세요.";
    else message = "오늘 기록은 개선 여지가 큽니다. 식사, 운동, 수면 중 한 가지부터 바로 보완해보세요.";
    document.getElementById('feedback').innerHTML = `<p>${message}</p>`;
}

/**
 * Updates the quest/recommendation section.
 */
function updateQuest(currentScore, targetScore, currentExerciseType) {
    const scoreDiff = targetScore - currentScore;
    const questDisplay = document.getElementById('quest-display');
    const exerciseLabels = {
        walking: '걷기',
        running: '러닝',
        cycling: '자전거',
        strength: '근력운동',
        yoga: '요가 / 필라테스',
        sports: '스포츠'
    };

    if (scoreDiff <= 0) {
        questDisplay.innerHTML = "<p><strong>목표 달성</strong></p><p>이미 목표 점수에 도달했습니다. 현재 생활 패턴을 유지해보세요.</p>";
        return;
    }

    // 1 point = approx 15 calories to burn (very rough estimate for gamification)
    const caloriesToBurn = scoreDiff * 15;

    // Minutes per 100 calories burned (estimates)
    const exerciseFactors = {
        'walking': 20,
        'running': 10,
        'cycling': 15,
        'strength': 12,
        'yoga': 25,
        'sports': 11
    };

    let recommendations = '<ul>';
    const quests = [];

    for (const [exercise, minutesPer100Cals] of Object.entries(exerciseFactors)) {
        const minutesNeeded = Math.round((caloriesToBurn / 100) * minutesPer100Cals);
        quests.push({ exercise, minutesNeeded });
    }

    // Sort by most efficient (least time)
    quests.sort((a, b) => a.minutesNeeded - b.minutesNeeded);

    // Prioritize user's selected exercise
    const userChoiceIndex = quests.findIndex(q => q.exercise === currentExerciseType);
    if (userChoiceIndex > 0) {
        const userQuest = quests.splice(userChoiceIndex, 1)[0];
        recommendations += `<li class="priority"><strong>우선 추천:</strong> ${exerciseLabels[userQuest.exercise]} ${userQuest.minutesNeeded}분 추가</li>`;
    }

    quests.forEach(q => {
         recommendations += `<li><strong>${exerciseLabels[q.exercise]}:</strong> ${q.minutesNeeded}분</li>`;
    });

    recommendations += '</ul>';

    questDisplay.innerHTML = 
        `<p>목표 점수 <strong>${targetScore}점</strong>까지 <strong>${scoreDiff}점</strong> 더 필요합니다.</p>
         <p>대략 <strong>${caloriesToBurn}kcal</strong>를 추가로 소모하는 활동량에 해당합니다.</p>` + recommendations;
}

/*
--- Next Feature Expansion ---

- **Firebase Integration**:
  - User Authentication (Login/Signup).
  - Save daily health scores to Firestore.
  
- **Data Analysis & Visualization**:
  - Calculate and display weekly/monthly average scores.
  - Charting/graphing of progress over time.

- **Gamification Features**:
  - Streak tracking for consecutive days of logging.
  - Badge system for achievements (e.g., "7-Day Streak", "Perfect Score", "First S-Rank").

- **Advanced Features**:
  - Allow users to upload photos of their meals.
  - AI-based analysis of meal photos for automated scoring.
*/
