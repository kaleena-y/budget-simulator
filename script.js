const state = {
  mode: "Monthly",
  income: { work: 1200, other: 500 },
  expenses: {
    rent: 800,
    utilities: 120,
    groceries: 250,
    transportation: 90,
    entertainment: 160,
    subscriptions: 140,
    other: 100,
  },
  activeScenario: null,
  previous: null,
  scenarioAdjustments: null,
  savings: 0,
};

const incomeItems = [
  { key: "work", label: "Work", max: 15000 },
  { key: "other", label: "Other", max: 15000 },
];

const expenseItems = [
  { key: "rent", label: "Rent", max: 15000 },
  { key: "utilities", label: "Utilities", max: 15000 },
  { key: "groceries", label: "Groceries", max: 15000 },
  { key: "transportation", label: "Transportation", max: 15000 },
  { key: "entertainment", label: "Entertainment", max: 15000 },
  { key: "subscriptions", label: "Subscriptions", max: 15000 },
  { key: "other", label: "Other", max: 15000 },
];

const scenarios = [
  {
    name: "Campus Life",
    values: {
      income: { work: 1100, other: 280 },
      expenses: {
        rent: 740,
        utilities: 110,
        groceries: 230,
        transportation: 80,
        entertainment: 140,
        subscriptions: 120,
        other: 80,
      },
    },
  },
  {
    name: "Off Campus",
    values: {
      income: { work: 1400, other: 520 },
      expenses: {
        rent: 950,
        utilities: 140,
        groceries: 280,
        transportation: 100,
        entertainment: 180,
        subscriptions: 160,
        other: 120,
      },
    },
  },
  {
    name: "Budgeting",
    values: {
      income: { work: 1300, other: 380 },
      expenses: {
        rent: 760,
        utilities: 105,
        groceries: 220,
        transportation: 75,
        entertainment: 80,
        subscriptions: 90,
        other: 50,
      },
    },
  },
];

const chartColors = {
  rent: "#6b5540",
  utilities: "#8c7355",
  groceries: "#a88f72",
  transportation: "#c4ab8e",
  entertainment: "#dec8ad",
  subscriptions: "#eae0d5",
  other: "#f5f0eb",
};

const modeMonthly = document.getElementById("modeMonthly");
const modeAnnual = document.getElementById("modeAnnual");
const incomeControls = document.getElementById("incomeControls");
const expenseControls = document.getElementById("expenseControls");
const scenarioList = document.getElementById("scenarioList");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const balanceEl = document.getElementById("balanceValue");
const savingsRateEl = document.getElementById("savingsRate");
const healthScoreEl = document.getElementById("healthScore");
const healthScoreCard = null;
const balanceCard = document.getElementById("balanceCard");
const totalAccountEl = document.getElementById("totalAccount");
const savingsInput = document.getElementById("savingsInput");
const totalIncomeLabel = document.getElementById("totalIncomeLabel");
const totalExpensesLabel = document.getElementById("totalExpensesLabel");
const barChart = document.getElementById("barChart");
const legendList = document.getElementById("legendList");
const breakdownList = document.getElementById("breakdownList");
const affordInput = document.getElementById("affordInput");
const affordMonths = document.getElementById("affordMonths");
const affordResult = document.getElementById("affordResult");
const affordSentence = document.getElementById("affordSentence");

let lastScrollY = window.scrollY;
let revealReady = false;
const revealDelay = 1000;

const revealObserver = new IntersectionObserver(
  (entries) => {
    const currentScrollY = window.scrollY;
    const directionClass =
      currentScrollY >= lastScrollY
        ? "reveal--from-bottom"
        : "reveal--from-top";

    entries.forEach((entry) => {
      const target = entry.target;
      if (entry.isIntersecting) {
        target.classList.remove("reveal--from-top", "reveal--from-bottom");
        target.classList.add(directionClass);
        target.classList.add("reveal--visible");
      } else {
        target.classList.remove("reveal--visible");
      }
    });

    lastScrollY = currentScrollY;
  },
  { 
    threshold: 0.15,
    rootMargin: "-30px 0px -30px 0px" 
  },
);

function observeRevealables() {
  if (!revealReady) return;

  document.querySelectorAll(".reveal:not(.reveal--observed)").forEach((el) => {
    el.classList.add("reveal--observed");
    revealObserver.observe(el);
  });
}

function markStaticRevealables() {
  document
    .querySelectorAll(".card, .summary-card, .afford-result")
    .forEach((el) => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
      }
    });
}

window.addEventListener("scroll", () => {
  lastScrollY = window.scrollY;
});

setTimeout(() => {
  revealReady = true;
  observeRevealables();
}, revealDelay);

function numeric(value) {
  return Number(value) || 0;
}

function viewValue(value) {
  return state.mode === "Monthly" ? value : value * 12;
}

function formatCurrency(value) {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-$" : "$"}${formatted}`;
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function renderControl(item, container, group) {
  const wrapper = document.createElement("div");
  wrapper.className = "control";

  const top = document.createElement("div");
  top.className = "control__top";
  const label = document.createElement("span");
  label.textContent = item.label;
  const valueLabel = document.createElement("span");
  valueLabel.dataset.label = item.key;
  const displayValue = viewValue(state[group][item.key]);
  const currencySuffix = state.mode === "Monthly" ? "/mo" : "/yr";
  valueLabel.textContent = `${formatCurrency(displayValue)} ${currencySuffix}`;
  top.append(label, valueLabel);

  const input = document.createElement("input");
  input.type = "text";
  input.min = 0;
  input.max = item.max * (state.mode === "Monthly" ? 1 : 12);
  input.step = 0.01;
  input.value = Number(displayValue).toFixed(2);
  input.className = "money-input";
  input.dataset.key = item.key;
  input.dataset.group = group;

  const sliderWrapper = document.createElement("div");
  sliderWrapper.className = "slider-wrap";
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = item.max * (state.mode === "Monthly" ? 1 : 12);
  slider.step = 0.01;
  slider.value = Number(displayValue).toFixed(2);
  slider.dataset.key = item.key;
  slider.dataset.group = group;

  sliderWrapper.appendChild(slider);
  wrapper.append(top, input, sliderWrapper);
  container.appendChild(wrapper);

  let lastVal = input.value;
  input.addEventListener("input", (e) => {
    const el = e.target;
    const prev = lastVal;
    const prevPos = el.selectionStart || 0;
    let val = el.value;
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    // limit to two decimals
    if (val.indexOf(".") >= 0) {
      const [intp, decp] = val.split(".");
      val = intp + "." + (decp || "").slice(0, 2);
    }

    const delta = val.length - prev.length;
    el.value = val;
    let newPos = Math.max(0, prevPos + delta);
    newPos = Math.min(val.length, newPos);
    try {
      el.setSelectionRange(newPos, newPos);
    } catch (err) {}
    lastVal = val;

    const parsed = parseFloat(val);
    const raw = Number.isNaN(parsed)
      ? 0
      : state.mode === "Monthly"
        ? parsed
        : parsed / 12;
    state[group][item.key] = Math.min(item.max, Math.max(0, raw));
    const shown = viewValue(state[group][item.key]);
    valueLabel.textContent = `${formatCurrency(shown)} ${currencySuffix}`;
    if (!Number.isNaN(parsed)) slider.value = Number(parsed).toFixed(2);

    updateDisplay();
    updateDonutChart();
  });

  slider.addEventListener("input", () => {
    const parsed = parseFloat(slider.value) || 0;
    state[group][item.key] = state.mode === "Monthly" ? parsed : parsed / 12;
    const shown = viewValue(state[group][item.key]);
    valueLabel.textContent = `${formatCurrency(shown)} ${currencySuffix}`;
    input.value = Number(shown).toFixed(2);

    updateDisplay();
    updateDonutChart();
  });

  input.addEventListener("blur", (e) => {
    let val = e.target.value.trim();
    if (val === "" || val === ".") {
      e.target.value = "0.00";
      state[group][item.key] = 0;
    } else {
      val = val.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length === 1) {
        val = parts[0] + ".00";
      } else {
        const intp = parts[0] || "0";
        const decp = (parts[1] || "").slice(0, 2);
        if (decp.length === 0) val = intp + ".00";
        else if (decp.length === 1) val = intp + "." + decp + "0";
        else val = intp + "." + decp;
      }
      e.target.value = val;
      const parsed = parseFloat(val) || 0;
      state[group][item.key] = state.mode === "Monthly" ? parsed : parsed / 12;
    }
    const shown = viewValue(state[group][item.key]);
    valueLabel.textContent = `${formatCurrency(shown)} ${currencySuffix}`;
    slider.value = Number(viewValue(state[group][item.key])).toFixed(2);

    updateDisplay();
    updateDonutChart();
  });
}

function populateControls() {
  incomeControls.innerHTML = "";
  expenseControls.innerHTML = "";
  incomeItems.forEach((item) => {
    renderControl(item, incomeControls, "income");
  });
  expenseItems.forEach((item) =>
    renderControl(item, expenseControls, "expenses"),
  );
}

function renderScenarios() {
  scenarioList.innerHTML = "";
  scenarios.forEach((scenario, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "scenario-item" + (state.activeScenario === index ? " active" : "");
    button.textContent = scenario.name;
    button.addEventListener("click", () => {
      if (state.activeScenario === index) {
        if (state.previous) {
          state.income = { ...state.previous.income };
          state.expenses = { ...state.previous.expenses };
        }

        state.activeScenario = null;
        state.previous = null;
        state.scenarioAdjustments = null;
      } else {
        if (state.activeScenario === null) {
          state.previous = {
            income: { ...state.income },
            expenses: { ...state.expenses },
          };
        } else {
          if (state.previous) {
            state.income = { ...state.previous.income };
            state.expenses = { ...state.previous.expenses };
          }
        }

        const scenario = scenarios[index];

        const adjustments = {
          income: {},
          expenses: {},
        };

        incomeItems.forEach((item) => {
          adjustments.income[item.key] =
            scenario.values.income[item.key] - state.previous.income[item.key];

          state.income[item.key] =
            state.previous.income[item.key] + adjustments.income[item.key];
        });

        expenseItems.forEach((item) => {
          adjustments.expenses[item.key] =
            scenario.values.expenses[item.key] -
            state.previous.expenses[item.key];

          state.expenses[item.key] =
            state.previous.expenses[item.key] + adjustments.expenses[item.key];
        });

        state.scenarioAdjustments = adjustments;
        state.activeScenario = index;
      }

      populateControls();
      renderScenarios();
      updateDisplay();
    });
    scenarioList.appendChild(button);
  });
}

function getHealthScore(balance, totalIncome) {
  if (balance <= 0) return "At Risk";
  const rate = totalIncome ? (balance / totalIncome) * 100 : 0;
  if (rate >= 25) return "Excellent";
  if (rate >= 15) return "Good";
  if (rate >= 5) return "Fair";
  return "At Risk";
}

function updateSummary() {
  const totalIncome = Object.values(state.income).reduce(
    (sum, value) => sum + numeric(value),
    0,
  );
  const totalExpenses = Object.values(state.expenses).reduce(
    (sum, value) => sum + numeric(value),
    0,
  );
  const balance = totalIncome - totalExpenses;
  const rate = totalIncome ? (balance / totalIncome) * 100 : 0;
  const health = getHealthScore(balance, totalIncome);
  const statusTag = document.getElementById("statusTag");

  if (statusTag) {
    if (balance < 0) {
      statusTag.textContent = "Over budget";
      statusTag.classList.add("negative");
    } else {
      statusTag.textContent = "Within budget";
      statusTag.classList.remove("negative");
    }
  }

  totalIncomeEl.textContent = formatCurrency(viewValue(totalIncome));
  totalExpensesEl.textContent = formatCurrency(viewValue(totalExpenses));
  balanceEl.textContent = formatCurrency(viewValue(balance));
  const balanceEl2 = document.getElementById("balanceValue");
  if (balanceEl2) {
    balanceEl2.style.color = balance < 0 ? "#8a3528" : "#2d5236";
  }
  const healthEl = document.getElementById("healthScore");
  const healthColors = {
    "At Risk": "#8a3528",
    Fair: "#82601b",
    Good: "#2e623a",
    Excellent: "#2e623a",
  };
  if (healthEl)
    healthEl.style.color =
      healthColors[getHealthScore(balance, totalIncome)] || "inherit";
  savingsRateEl.textContent = formatPercent(rate);
  healthScoreEl.textContent = health;
  const totalAccount = Number(state.savings || 0) + viewValue(balance);
  if (totalAccountEl) totalAccountEl.textContent = formatCurrency(totalAccount);

  if (healthScoreCard) {
    healthScoreCard.classList.remove("at-risk", "fair", "good", "excellent");
    healthScoreCard.classList.add(health.toLowerCase().replace(" ", "-"));
  }

  if (balanceCard) {
    balanceCard.classList.toggle("negative", balance < 0);
  }
  updateDonutChart();
  return { totalIncome, totalExpenses, balance };
}

function renderBudgetChart(values) {
  barChart.innerHTML = "";
  const totalIncome = values.totalIncome;
  const totalExpenses = values.totalExpenses;
  const cap = Math.max(totalIncome, totalExpenses, 1);

  const createBar = (labelText, value, color) => {
    const bar = document.createElement("div");
    bar.className = "bar-item";
    const label = document.createElement("label");
    const modeLabel = state.mode === "Monthly" ? "Monthly" : "Annual";
    label.innerHTML = `<span>${modeLabel} ${labelText}</span> <strong>${formatCurrency(viewValue(value))}</strong>`;
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.background = color;
    fill.style.width = `${Math.min(100, (value / cap) * 100)}%`;
    track.appendChild(fill);
    bar.append(label, track);
    barChart.appendChild(bar);
  };

  createBar("Income", totalIncome, "var(--accent)");
  createBar("Expenses", totalExpenses, "var(--accent-strong)");
}

function renderLegend() {
  legendList.innerHTML = "";
  Object.entries(chartColors).forEach(([key, color]) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = color;
    item.append(
      dot,
      document.createTextNode(key.charAt(0).toUpperCase() + key.slice(1)),
    );
    legendList.appendChild(item);
  });
}

function renderBreakdown(values) {
  breakdownList.innerHTML = "";
  const total = values.totalExpenses || 1;
  expenseItems.forEach((item) => {
    const amount = numeric(state.expenses[item.key]);
    const share = total ? (amount / total) * 100 : 0;
    const row = document.createElement("div");
    row.className = "breakdown-item reveal";
    const moneyValue = formatCurrency(viewValue(amount));
    const percentValue = `${Math.round(share)}%`;
    row.innerHTML = `<span>${item.label}</span><strong>${moneyValue}</strong><span>${percentValue}</span>`;
    breakdownList.appendChild(row);
  });
}

function updateAffordability(values) {
  console.log("updateAffordability running");
  const desired = parseFloat(affordInput.value.replace(/[^0-9.]/g, "")) || 0;
  const saved = Number(state.savings || 0);
  const monthlyBalance = values.balance;
  const viewedBalance = viewValue(monthlyBalance);
  const availableNow = saved + viewedBalance;
  const desiredLeft = Math.max(0, desired - availableNow);
  const monthlyLeft = monthlyBalance;

  let months = null;
  if (desired <= 0) {
    months = 0;
  } else if (desiredLeft <= 0) {
    months = 0;
  } else if (monthlyLeft > 0) {
    months = Math.ceil(desiredLeft / monthlyLeft);
  }

  if (affordResult) {
    affordResult.classList.remove("already-saved", "not-enough");
    if (months === 0) affordResult.classList.add("already-saved");
    else if (months === null) affordResult.classList.add("not-enough");
  }

  function formatTimeDuration(totalMonths) {
    if (totalMonths === null) return "Not enough savings";
    if (totalMonths === 0) return "Already saved";

    const yrs = Math.floor(totalMonths / 12);
    const mths = totalMonths % 12;

    let parts = [];
    if (yrs > 0) parts.push(`${yrs} year${yrs === 1 ? "" : "s"}`);
    if (mths > 0) parts.push(`${mths} month${mths === 1 ? "" : "s"}`);

    return parts.join(" ");
  }

  const durationText = formatTimeDuration(months);
  affordMonths.textContent = durationText;

  if (months === null || desired <= 0 || months === 0) {
    affordSentence.textContent = "";
  } else {
    affordSentence.textContent = `Saving ${formatCurrency(monthlyLeft)} /mo with ${formatCurrency(saved)} already set aside, you'll reach your goal in ${durationText}.`;
  }
}

function updateDisplay() {
  const totals = updateSummary();
  renderBudgetChart(totals);
  renderBreakdown(totals);
  updateAffordability(totals);
  observeRevealables();
}

function refresh() {
  populateControls();
  markStaticRevealables();
  if (savingsInput) savingsInput.value = (state.savings || 0).toFixed(2);
  updateDisplay();
}

function switchMode(mode) {
  state.mode = mode;
  modeMonthly.classList.toggle("active", mode === "Monthly");
  modeAnnual.classList.toggle("active", mode === "Annually");
  if (totalIncomeLabel)
    totalIncomeLabel.textContent =
      mode === "Monthly" ? "Monthly Income" : "Annual Income";
  if (totalExpensesLabel)
    totalExpensesLabel.textContent =
      mode === "Monthly" ? "Monthly Expenses" : "Annual Expenses";
  refresh();
}

modeMonthly.addEventListener("click", () => switchMode("Monthly"));
modeAnnual.addEventListener("click", () => switchMode("Annually"));
let affordLast = affordInput.value || "";
affordInput.addEventListener("input", (e) => {
  const el = e.target;
  const prev = affordLast;
  const prevPos = el.selectionStart || 0;
  let val = el.value;
  val = val.replace(/[^0-9.]/g, "");
  const parts = val.split(".");
  if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
  if (val.indexOf(".") >= 0) {
    const [i, d] = val.split(".");
    val = i + "." + (d || "").slice(0, 2);
  }
  const delta = val.length - prev.length;
  el.value = val;
  let newPos = Math.max(0, prevPos + delta);
  newPos = Math.min(val.length, newPos);
  try {
    el.setSelectionRange(newPos, newPos);
  } catch (err) {}
  affordLast = val;
  updateDisplay();
});

affordInput.addEventListener("blur", (e) => {
  let val = e.target.value.trim();
  if (val === "" || val === ".") {
    e.target.value = "0.00";
  } else {
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length === 1) {
      val = parts[0] + ".00";
    } else {
      const i = parts[0] || "0";
      const d = (parts[1] || "").slice(0, 2);
      if (d.length === 0) val = i + ".00";
      else if (d.length === 1) val = i + "." + d + "0";
      else val = i + "." + d;
    }
    e.target.value = val;
  }
  updateDisplay();
});

let savingsLast = savingsInput ? savingsInput.value || "" : "";
if (savingsInput) {
  savingsInput.addEventListener("input", (e) => {
    const el = e.target;
    const prev = savingsLast;
    const prevPos = el.selectionStart || 0;
    let val = el.value;
    val = val.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    if (val.indexOf(".") >= 0) {
      const [i, d] = val.split(".");
      val = i + "." + (d || "").slice(0, 2);
    }
    const delta = val.length - prev.length;
    el.value = val;
    let newPos = Math.max(0, prevPos + delta);
    newPos = Math.min(val.length, newPos);
    try {
      el.setSelectionRange(newPos, newPos);
    } catch (err) {}
    savingsLast = val;
    state.savings = parseFloat(val) || 0;
    updateDisplay();
  });

  savingsInput.addEventListener("blur", (e) => {
    let val = e.target.value.trim();
    if (val === "" || val === ".") {
      e.target.value = "0.00";
    } else {
      val = val.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length === 1) {
        val = parts[0] + ".00";
      } else {
        const i = parts[0] || "0";
        const d = (parts[1] || "").slice(0, 2);
        if (d.length === 0) val = i + ".00";
        else if (d.length === 1) val = i + "." + d + "0";
        else val = i + "." + d;
      }
      e.target.value = val;
    }
    state.savings = parseFloat(e.target.value) || 0;
    updateDisplay();
  });
}

function updateDonutChart() {
  requestAnimationFrame(() => {
    const workInc = numeric(state.income.work);
    const otherInc = numeric(state.income.other);
    const totalInc = workInc + otherInc;
    const rentVal = numeric(state.expenses.rent);
    const utilitiesVal = numeric(state.expenses.utilities);
    const groceriesVal = numeric(state.expenses.groceries);
    const transportationVal = numeric(state.expenses.transportation);
    const entertainmentVal = numeric(state.expenses.entertainment);
    const subscriptionsVal = numeric(state.expenses.subscriptions);
    const otherVal = numeric(state.expenses.other);

    const totalExp =
      rentVal +
      utilitiesVal +
      groceriesVal +
      transportationVal +
      entertainmentVal +
      subscriptionsVal +
      otherVal;

    const centerText = document.getElementById("donutTotalValue");
    if (centerText) {
      centerText.textContent = formatCurrency(viewValue(totalExp));
    }

    const circle = document.getElementById("donutChartCircle");
    if (circle) {
      if (totalExp === 0) {
        circle.style.background = "#f5f0eb";
      } else {
        const pRent = (rentVal / totalExp) * 100;
        const pGroceries = (groceriesVal / totalExp) * 100;
        const pEntertain = (entertainmentVal / totalExp) * 100;
        const pSub = (subscriptionsVal / totalExp) * 100;
        const pUtil = (utilitiesVal / totalExp) * 100;
        const pTrans = (transportationVal / totalExp) * 100;

        const s1 = pRent;
        const s2 = s1 + pGroceries;
        const s3 = s2 + pEntertain;
        const s4 = s3 + pSub;
        const s5 = s4 + pUtil;
        const s6 = s5 + pTrans;

        circle.style.background = `conic-gradient(
          #6b5540 0% ${s1}%,
          #8c7355 ${s1}% ${s2}%,
          #a88f72 ${s2}% ${s3}%,
          #c4ab8e ${s3}% ${s4}%,
          #dec8ad ${s4}% ${s5}%,
          #eae0d5 ${s5}% ${s6}%,
          #f5f0eb ${s6}% 100%
        )`;
      }
    }

    const breakdownContainer = document.getElementById("breakdownList");
    if (breakdownContainer) {
      const items = [
        { label: "Rent", val: rentVal, color: "#6b5540" },
        { label: "Groceries", val: groceriesVal, color: "#8c7355" },
        { label: "Entertainment", val: entertainmentVal, color: "#a88f72" },
        { label: "Subscriptions", val: subscriptionsVal, color: "#c4ab8e" },
        { label: "Utilities", val: utilitiesVal, color: "#dec8ad" },
        { label: "Transportation", val: transportationVal, color: "#eae0d5" },
        { label: "Other", val: otherVal, color: "#f5f0eb" },
      ];

      items.sort((a, b) => b.val - a.val);

      const headerHtml = `
        <div class="breakdown-header">
          <span>Category</span>
          <strong>Amount</strong>
          <span>Percentage</span>
        </div>
      `;

      const itemsHtml = items
        .map((item) => {
          const pct =
            totalExp > 0 ? Math.round((item.val / totalExp) * 100) : 0;
          return `
          <div class="breakdown-item">
            <div class="breakdown-color-strip" style="background-color: ${item.color}; width: 6px; height: 24px; border-radius: 4px;"></div>
            <span>${item.label}</span>
            <strong>${formatCurrency(viewValue(item.val))}</strong>
            <span class="breakdown-pct">${pct}%</span>
          </div>
        `;
        })
        .join("");

      breakdownContainer.innerHTML = headerHtml + itemsHtml;
    }
  });
}

function initDonutTooltip() {
  const circle = document.getElementById("donutChartCircle");
  const tooltip = document.getElementById("donutTooltip");

  if (!circle) {
    console.warn("donutChartCircle element not found");
    return;
  }
  if (!tooltip) {
    console.warn("donutTooltip element not found");
    return;
  }

  circle.addEventListener("mousemove", (e) => {
    const rentVal = numeric(state.expenses.rent);
    const utilitiesVal = numeric(state.expenses.utilities);
    const groceriesVal = numeric(state.expenses.groceries);
    const transportationVal = numeric(state.expenses.transportation);
    const entertainmentVal = numeric(state.expenses.entertainment);
    const subscriptionsVal = numeric(state.expenses.subscriptions);
    const otherVal = numeric(state.expenses.other);

    const totalExp =
      rentVal +
      utilitiesVal +
      groceriesVal +
      transportationVal +
      entertainmentVal +
      subscriptionsVal +
      otherVal;
    if (totalExp === 0) {
      tooltip.style.opacity = 0;
      return;
    }

    const items = [
      { label: "Rent", pct: (rentVal / totalExp) * 100, color: "#6b5540" },
      {
        label: "Groceries",
        pct: (groceriesVal / totalExp) * 100,
        color: "#8c7355",
      },
      {
        label: "Entertainment",
        pct: (entertainmentVal / totalExp) * 100,
        color: "#a88f72",
      },
      {
        label: "Subscriptions",
        pct: (subscriptionsVal / totalExp) * 100,
        color: "#c4ab8e",
      },
      {
        label: "Utilities",
        pct: (utilitiesVal / totalExp) * 100,
        color: "#dec8ad",
      },
      {
        label: "Transportation",
        pct: (transportationVal / totalExp) * 100,
        color: "#eae0d5",
      },
      { label: "Other", pct: (otherVal / totalExp) * 100, color: "#f5f0eb" },
    ];

    const rect = circle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    let angleRad = Math.atan2(mouseX - centerX, centerY - mouseY);
    let angleDeg = angleRad * (180 / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    let runningSum = 0;
    let hoveredItem = null;

    for (const item of items) {
      const sliceStart = (runningSum / 100) * 360;
      runningSum += item.pct;
      const sliceEnd = (runningSum / 100) * 360;

      if (angleDeg >= sliceStart && angleDeg < sliceEnd) {
        hoveredItem = item;
        break;
      }
    }

    if (hoveredItem && hoveredItem.pct > 0) {
      tooltip.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; font-family: sans-serif;">
          <span style="display: inline-block; width: 8px; height: 8px; background-color: ${hoveredItem.color}; border-radius: 50%; flex-shrink: 0;"></span>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-weight: 700; color: var(--accent-strong, #1a1c18); line-height: 1;">${hoveredItem.label}</span>
            <span style="font-size: 0.8rem; color: var(--muted, #757772); font-weight: 500;">${Math.round(hoveredItem.pct)}% of expenses</span>
          </div>
        </div>
      `;
      const ttW = tooltip.offsetWidth || 180;
      const ttH = tooltip.offsetHeight || 60;
      let left = e.clientX + 16;
      let top = e.clientY + 16;

      if (left + ttW > window.innerWidth - 8) left = e.clientX - ttW - 16;
      if (top + ttH > window.innerHeight - 8) top = e.clientY - ttH - 16;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.opacity = 1;
    } else {
      tooltip.style.opacity = 0;
    }
  });

  circle.addEventListener("mouseleave", () => {
    tooltip.style.opacity = 0;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDonutTooltip();
  renderScenarios();
  refresh();
  updateDonutChart();
});
