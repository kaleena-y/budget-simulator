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
    name: "Saver Plan",
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
  rent: "#4338ca",
  utilities: "#6366f1",
  groceries: "#818cf8",
  transportation: "#a5b4fc",
  entertainment: "#c7d2fe",
  subscriptions: "#e0e7ff",
  other: "#f3f4f6",
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
const healthScoreCard = document.querySelector(".summary-card.health-score");
const balanceCard = document.querySelector(".summary-card.balance-card");
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

  // Input typing: allow deletion, one dot, up to two decimals
  // preserve cursor while sanitizing input
  let lastVal = input.value;
  input.addEventListener("input", (e) => {
    const el = e.target;
    const prev = lastVal;
    const prevPos = el.selectionStart || 0;
    let val = el.value;
    // remove invalid chars
    val = val.replace(/[^0-9.]/g, "");
    // ensure only one dot
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    // limit to two decimals
    if (val.indexOf(".") >= 0) {
      const [intp, decp] = val.split(".");
      val = intp + "." + (decp || "").slice(0, 2);
    }
    // compute new cursor position
    const delta = val.length - prev.length;
    el.value = val;
    let newPos = Math.max(0, prevPos + delta);
    // clamp
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
    if (state.activeScenario) {
      state.activeScenario = null;
      renderScenarios();
    }
    updateDisplay();
  });

  // Slider updates input and state
  slider.addEventListener("input", () => {
    const parsed = parseFloat(slider.value) || 0;
    state[group][item.key] = state.mode === "Monthly" ? parsed : parsed / 12;
    const shown = viewValue(state[group][item.key]);
    valueLabel.textContent = `${formatCurrency(shown)} ${currencySuffix}`;
    input.value = Number(shown).toFixed(2);
    if (state.activeScenario) {
      state.activeScenario = null;
      renderScenarios();
    }
    updateDisplay();
  });

  // Format on blur: ensure two decimals, allow empty to become 0.00
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
    if (state.activeScenario) {
      state.activeScenario = null;
      renderScenarios();
    }
    updateDisplay();
  });
}

function populateControls() {
  incomeControls.innerHTML = "";
  expenseControls.innerHTML = "";
  incomeItems.forEach((item) => renderControl(item, incomeControls, "income"));
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
      } else {
        if (state.activeScenario === null) {
          state.previous = {
            income: { ...state.income },
            expenses: { ...state.expenses },
          };
        }
        state.activeScenario = index;
        state.income = { ...scenario.values.income };
        state.expenses = { ...scenario.values.expenses };
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

  totalIncomeEl.textContent = formatCurrency(viewValue(totalIncome));
  totalExpensesEl.textContent = formatCurrency(viewValue(totalExpenses));
  balanceEl.textContent = formatCurrency(viewValue(balance));
  savingsRateEl.textContent = formatPercent(rate);
  healthScoreEl.textContent = health;
  // total account value = existing savings + balance (converted by mode)
  const totalAccount = Number(state.savings || 0) + viewValue(balance);
  if (totalAccountEl) totalAccountEl.textContent = formatCurrency(totalAccount);

  if (healthScoreCard) {
    healthScoreCard.classList.remove("at-risk", "fair", "good", "excellent");
    healthScoreCard.classList.add(health.toLowerCase().replace(" ", "-"));
  }

  if (balanceCard) {
    balanceCard.classList.toggle("negative", balance < 0);
  }

  return { totalIncome, totalExpenses, balance };
}

function renderBudgetChart(values) {
  barChart.innerHTML = "";
  const cap = Math.max(values.totalIncome, values.totalExpenses, 1200, 1);
  const incomeBar = document.createElement("div");
  incomeBar.className = "bar-item";
  incomeBar.innerHTML = `<label>Income <strong>${formatCurrency(viewValue(values.totalIncome))}</strong></label>
        <div class="bar-track"><div class="bar-fill" style="width: ${Math.min(100, (values.totalIncome / cap) * 100)}%; background: ${chartColors.rent};"></div></div>`;
  const expenseBar = document.createElement("div");
  expenseBar.className = "bar-item";
  expenseBar.innerHTML = `<label>Expenses <strong>${formatCurrency(viewValue(values.totalExpenses))}</strong></label>
        <div class="bar-track"><div class="bar-fill" style="width: ${Math.min(100, (values.totalExpenses / cap) * 100)}%; background: ${chartColors.utilities};"></div></div>`;
  barChart.append(incomeBar, expenseBar);
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
    row.className = "breakdown-item";
    const moneyValue = formatCurrency(viewValue(amount));
    const percentValue = `${Math.round(share)}%`;
    row.innerHTML = `<span>${item.label}</span><strong>${moneyValue}</strong><span>${percentValue}</span>`;
    breakdownList.appendChild(row);
  });
}

function updateAffordability(values) {
  const desired = numeric(affordInput.value);
  const saved = Number(state.savings || 0);
  const availableNow = saved + viewValue(values.balance);
  const desiredLeft = Math.max(0, desired - availableNow);
  const monthlyLeft =
    state.mode === "Monthly" ? values.balance : values.balance / 12;
  let months = null;
  if (desiredLeft <= 0) months = 0;
  else if (monthlyLeft > 0) months = Math.ceil(desiredLeft / monthlyLeft);

  // Update affordResult classes based on state
  if (affordResult) {
    affordResult.classList.remove("already-saved", "not-enough");
    if (months === 0) {
      affordResult.classList.add("already-saved");
    } else if (months === null) {
      affordResult.classList.add("not-enough");
    }
  }

  affordMonths.textContent =
    months === null
      ? "Not enough savings"
      : months === 0
        ? "Already saved"
        : `${months} month${months === 1 ? "" : "s"}`;
  if (months === null || desired <= 0) {
    affordSentence.textContent = "";
  } else if (months === 0) {
    affordSentence.textContent = "";
  } else {
    const monthLabel = months === 1 ? "month" : "months";
    const exactSavings = monthlyLeft.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    affordSentence.textContent = `To purchase a $${desired.toLocaleString()} item with $${saved.toLocaleString()} saved and your remaining balance, you need to save ${exactSavings} /mo for ${months} ${monthLabel}.`;
  }
}

function updateDisplay() {
  const totals = updateSummary();
  renderBudgetChart(totals);
  renderLegend();
  renderBreakdown(totals);
  updateAffordability(totals);
}

function refresh() {
  populateControls();
  if (savingsInput) savingsInput.value = (state.savings || 0).toFixed(2);
  updateDisplay();
}

function switchMode(mode) {
  state.mode = mode;
  modeMonthly.classList.toggle("active", mode === "Monthly");
  modeAnnual.classList.toggle("active", mode === "Annually");
  // update labels for income/expenses when switching to annual view
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
// afford input: allow decimals while typing, format on blur
// afford input: preserve cursor while typing
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

// savings input: allow decimals while typing, format on blur, update state.savings
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

renderScenarios();
refresh();
