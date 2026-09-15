"use strict";

/* =========================================================
   FINTRACK - SCRIPT.JS
   Dashboard + Transactions + Budget + Chart + AI Insight
   ========================================================= */

/* =========================
   STORAGE
   ========================= */

const STORAGE_KEYS = {
    transactions: "fintrack_transactions",
    budget: "fintrack_budget"
};


/* =========================
   GLOBAL STATE
   ========================= */

let transactions = loadTransactions();
let budget = loadBudget();

let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();

let expenseChart = null;


/* =========================
   DOM READY
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
    initializeMonth();
    initializeDate();
    updateGreeting();
    setupEventListeners();
    updateDashboard();
});


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.transactions);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error loading transactions:", error);
        return [];
    }
}


function saveTransactions() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.transactions,
            JSON.stringify(transactions)
        );

        return true;
    } catch (error) {
        console.error("Error saving transactions:", error);

        showToast(
            "Storage Error",
            "Transaction could not be saved.",
            "error"
        );

        return false;
    }
}


function loadBudget() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.budget);

        if (!data) {
            return {
                min: 0,
                max: 0
            };
        }

        const parsed = JSON.parse(data);

        return {
            min: Number(parsed.min) || 0,
            max: Number(parsed.max) || 0
        };
    } catch (error) {
        console.error("Error loading budget:", error);

        return {
            min: 0,
            max: 0
        };
    }
}


function saveBudget(newBudget) {
    budget = {
        min: Number(newBudget.min) || 0,
        max: Number(newBudget.max) || 0
    };

    try {
        localStorage.setItem(
            STORAGE_KEYS.budget,
            JSON.stringify(budget)
        );

        updateDashboard();
    } catch (error) {
        console.error("Error saving budget:", error);
    }
}


/* =========================================================
   DOM HELPERS
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function setText(id, value) {
    const element = getElement(id);

    if (element) {
        element.textContent = value;
    }
}


function setHTML(id, value) {
    const element = getElement(id);

    if (element) {
        element.innerHTML = value;
    }
}


/* =========================================================
   MONTH
   ========================================================= */

function initializeMonth() {
    const now = new Date();

    selectedMonth = now.getMonth();
    selectedYear = now.getFullYear();

    const selector = getElement("monthSelector");

    if (selector) {
        selector.value = String(selectedMonth);
    }

    updateMonthTitle();
}


function handleMonthChange(event) {
    selectedMonth = Number(event.target.value);

    updateMonthTitle();
    updateDashboard();
}


function updateMonthTitle() {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    setText(
        "currentMonth",
        `${months[selectedMonth]} ${selectedYear}`
    );
}


/* =========================================================
   DATE
   ========================================================= */

function getTodayString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function initializeDate() {
    const input = getElement("transactionDate");

    if (input) {
        input.value = getTodayString();
    }
}


/* =========================================================
   GREETING
   ========================================================= */

function updateGreeting() {
    const greeting = getElement("greeting");

    if (!greeting) {
        return;
    }

    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent = "Good morning ☀️";
    } else if (hour < 17) {
        greeting.textContent = "Good afternoon 🌤️";
    } else {
        greeting.textContent = "Good evening 🌙";
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    /* Add transaction */
    const addButton = getElement("addTransactionBtn");

    if (addButton) {
        addButton.addEventListener("click", () => {
            openModal("expense");
        });
    }


    /* Empty state add button */
    const emptyButton = getElement("emptyAddBtn");

    if (emptyButton) {
        emptyButton.addEventListener("click", () => {
            openModal("expense");
        });
    }


    /* Close modal */
    const closeButton = getElement("closeModal");

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }


    /* Modal overlay */
    const modal = getElement("transactionModal");

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }


    /* Transaction form */
    const form = getElement("transactionForm");

    if (form) {
        form.addEventListener(
            "submit",
            handleTransactionSubmit
        );
    }


    /* Month selector */
    const monthSelector = getElement("monthSelector");

    if (monthSelector) {
        monthSelector.addEventListener(
            "change",
            handleMonthChange
        );
    }


    /* Chart filter */
    const chartFilter = getElement("chartFilter");

    if (chartFilter) {
        chartFilter.addEventListener(
            "change",
            updateChart
        );
    }


    /* Mobile menu */
    const mobileMenu = getElement("mobileMenu");
    const sidebar = getElement("sidebar");

    if (mobileMenu && sidebar) {
        mobileMenu.addEventListener("click", (event) => {
            event.stopPropagation();

            sidebar.classList.toggle("open");
        });
    }


    /* Transaction type */
    const typeInputs = document.querySelectorAll(
        'input[name="transactionType"]'
    );

    typeInputs.forEach((input) => {
        input.addEventListener(
            "change",
            updateTypeSelector
        );
    });


    /* Quick actions */
    const quickButtons = document.querySelectorAll(
        ".quick-btn[data-type]"
    );

    quickButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const type = button.dataset.type || "expense";

            openModal(type);
        });
    });


    /* Toast close */
    const toastClose = getElement("closeToast");

    if (toastClose) {
        toastClose.addEventListener(
            "click",
            hideToast
        );
    }


    /* Escape key */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const modalElement =
                getElement("transactionModal");

            if (
                modalElement &&
                modalElement.classList.contains("show")
            ) {
                closeModal();
            }
        }
    });
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(type = "expense") {
    const modal = getElement("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.add("show");

    document.body.style.overflow = "hidden";


    /* Select transaction type */
    const radio = document.querySelector(
        `input[name="transactionType"][value="${type}"]`
    );

    if (radio) {
        radio.checked = true;
    }

    updateTypeSelector();
    initializeDate();


    /* Focus description */
    setTimeout(() => {
        const input = getElement("transactionName");

        if (input) {
            input.focus();
        }
    }, 200);
}


function closeModal() {
    const modal = getElement("transactionModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    document.body.style.overflow = "";


    const form = getElement("transactionForm");

    if (form) {
        form.reset();
    }


    /* Default back to expense */
    const expenseRadio = document.querySelector(
        'input[name="transactionType"][value="expense"]'
    );

    if (expenseRadio) {
        expenseRadio.checked = true;
    }

    updateTypeSelector();
    initializeDate();
}


/* =========================================================
   TRANSACTION TYPE UI
   ========================================================= */

function updateTypeSelector() {
    const options = document.querySelectorAll(
        ".type-option"
    );

    options.forEach((option) => {
        const input = option.querySelector("input");

        if (input && input.checked) {
            option.classList.add("active");
        } else {
            option.classList.remove("active");
        }
    });
}


/* =========================================================
   ADD TRANSACTION
   ========================================================= */

function handleTransactionSubmit(event) {
    event.preventDefault();


    /* Type */
    const typeInput = document.querySelector(
        'input[name="transactionType"]:checked'
    );

    const type = typeInput
        ? typeInput.value
        : "expense";


    /* Inputs */
    const nameInput =
        getElement("transactionName");

    const amountInput =
        getElement("transactionAmount");

    const categoryInput =
        getElement("transactionCategory");

    const dateInput =
        getElement("transactionDate");

    const paymentInput =
        getElement("paymentMethod");

    const notesInput =
        getElement("transactionNotes");


    /* Check elements */
    if (
        !nameInput ||
        !amountInput ||
        !categoryInput ||
        !dateInput
    ) {
        console.error(
            "Transaction form elements are missing."
        );

        return;
    }


    /* Values */
    const name = nameInput.value.trim();

    const amount = Number(
        amountInput.value
    );

    const category =
        categoryInput.value;

    const date =
        dateInput.value;

    const paymentMethod =
        paymentInput
            ? paymentInput.value
            : "Other";

    const notes =
        notesInput
            ? notesInput.value.trim()
            : "";


    /* Validation */
    if (!name) {
        showToast(
            "Description Required",
            "Please enter a transaction description.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        showToast(
            "Invalid Amount",
            "Please enter an amount greater than ₹0.",
            "error"
        );

        return;
    }


    if (!category) {
        showToast(
            "Category Required",
            "Please select a category.",
            "error"
        );

        return;
    }


    if (!date) {
        showToast(
            "Date Required",
            "Please select a date.",
            "error"
        );

        return;
    }


    /* Create transaction */
    const transaction = {
        id: generateID(),

        type: type,

        name: name,

        amount: amount,

        category: category,

        date: date,

        paymentMethod: paymentMethod,

        notes: notes,

        createdAt: new Date().toISOString()
    };


    /* Add to beginning */
    transactions.unshift(transaction);


    /* Save */
    const saved = saveTransactions();

    if (!saved) {
        return;
    }


    /* Update UI */
    updateDashboard();

    closeModal();


    showToast(
        "Transaction Added",
        `${type === "income" ? "Income" : "Expense"} added successfully.`
    );
}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function generateID() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/* =========================================================
   MONTHLY TRANSACTIONS
   ========================================================= */

function getMonthlyTransactions() {
    return transactions.filter((transaction) => {

        if (!transaction.date) {
            return false;
        }

        const date = new Date(
            `${transaction.date}T00:00:00`
        );

        return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear
        );
    });
}


/* =========================================================
   MONTHLY CALCULATIONS
   ========================================================= */

function calculateMonthlyData() {
    const monthlyTransactions =
        getMonthlyTransactions();


    let income = 0;
    let expense = 0;

    let incomeCount = 0;
    let expenseCount = 0;


    monthlyTransactions.forEach((transaction) => {

        const amount =
            Number(transaction.amount) || 0;


        if (transaction.type === "income") {
            income += amount;
            incomeCount++;
        } else {
            expense += amount;
            expenseCount++;
        }
    });


    const balance =
        income - expense;

    const savings =
        Math.max(balance, 0);


    const savingsPercentage =
        income > 0
            ? (savings / income) * 100
            : 0;


    return {
        transactions: monthlyTransactions,

        income: income,

        expense: expense,

        balance: balance,

        savings: savings,

        savingsPercentage:
            savingsPercentage,

        incomeCount:
            incomeCount,

        expenseCount:
            expenseCount
    };
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    updateMonthTitle();


    const data =
        calculateMonthlyData();


    /* Financial cards */
    setText(
        "totalBalance",
        formatCurrency(data.balance)
    );

    setText(
        "totalIncome",
        formatCurrency(data.income)
    );

    setText(
        "totalExpense",
        formatCurrency(data.expense)
    );

    setText(
        "totalSavings",
        formatCurrency(data.savings)
    );


    /* Counts */
    setText(
        "incomeCount",
        `${data.incomeCount} ${
            data.incomeCount === 1
                ? "transaction"
                : "transactions"
        }`
    );

    setText(
        "expenseCount",
        `${data.expenseCount} ${
            data.expenseCount === 1
                ? "transaction"
                : "transactions"
        }`
    );


    /* Savings */
    setText(
        "savingsPercentage",
        `${data.savingsPercentage.toFixed(1)}%`
    );


    updateBalanceChange(data);

    updateBudget(data);

    updateRecentTransactions(data);

    updateChart();

    updateAIInsight(data);
}


/* =========================================================
   BALANCE CHANGE
   ========================================================= */

function updateBalanceChange(data) {
    const element =
        getElement("balanceChange");

    if (!element) {
        return;
    }


    if (data.income <= 0) {
        element.textContent = "0%";
        return;
    }


    const percentage =
        (data.balance / data.income) * 100;


    element.textContent =
        `${percentage.toFixed(1)}%`;
}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(amount) {
    const value =
        Number(amount) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);
}


/* =========================================================
   BUDGET
   ========================================================= */

function updateBudget(data) {

    setText(
        "minBudget",
        formatCurrency(budget.min)
    );

    setText(
        "maxBudget",
        formatCurrency(budget.max)
    );


    const spent =
        data.expense;


    const maximum =
        Number(budget.max) || 0;


    let percentage = 0;


    if (maximum > 0) {
        percentage =
            (spent / maximum) * 100;
    }


    const displayPercentage =
        Math.min(Math.max(percentage, 0), 100);


    setText(
        "budgetPercentage",
        `${Math.round(percentage)}%`
    );


    setText(
        "spentAmount",
        `${formatCurrency(spent)} spent`
    );


    const remaining =
        maximum > 0
            ? Math.max(maximum - spent, 0)
            : 0;


    setText(
        "remainingAmount",
        `${formatCurrency(remaining)} remaining`
    );


    const progress =
        getElement("budgetProgress");


    if (progress) {
        progress.style.width =
            `${displayPercentage}%`;
    }


    updateBudgetStatus(
        spent,
        maximum,
        data
    );
}


/* =========================================================
   BUDGET STATUS
   ========================================================= */

function updateBudgetStatus(
    spent,
    maximum,
    data
) {

    const status =
        getElement("budgetStatus");


    if (!status) {
        return;
    }


    let icon =
        "fa-circle-check";

    let message =
        "You're within your budget.";


    if (maximum <= 0) {

        icon =
            "fa-circle-info";

        message =
            "Set a maximum budget to track your spending.";
    }

    else if (spent > maximum) {

        icon =
            "fa-triangle-exclamation";

        message =
            `You've exceeded your budget by ${formatCurrency(
                spent - maximum
            )}.`;

    }

    else if (spent >= maximum * 0.8) {

        icon =
            "fa-circle-exclamation";

        message =
            "You're getting close to your maximum budget.";

    }

    else if (
        budget.min > 0 &&
        data.income > 0 &&
        data.savings < budget.min
    ) {

        icon =
            "fa-lightbulb";

        message =
            "Try to save more this month.";
    }


    status.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHTML(message)}</span>
    `;
}


/* =========================================================
   RECENT TRANSACTIONS
   ========================================================= */

function updateRecentTransactions(data) {

    const container =
        getElement("recentTransactions");


    if (!container) {
        return;
    }


    if (!data.transactions.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>

                <h4>No transactions yet</h4>

                <p>
                    Start by adding your first transaction.
                </p>

                <button
                    class="secondary-btn"
                    id="dynamicEmptyAddBtn"
                    type="button"
                >
                    <i class="fa-solid fa-plus"></i>
                    Add Transaction
                </button>
            </div>
        `;


        const button =
            getElement("dynamicEmptyAddBtn");


        if (button) {
            button.addEventListener(
                "click",
                () => openModal("expense")
            );
        }


        return;
    }


    const recent =
        [...data.transactions]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    container.innerHTML =
        recent
            .map(createTransactionHTML)
            .join("");
}


/* =========================================================
   TRANSACTION HTML
   ========================================================= */

function createTransactionHTML(transaction) {

    const isIncome =
        transaction.type === "income";


    const icon =
        getCategoryIcon(
            transaction.category
        );


    const sign =
        isIncome ? "+" : "-";


    const amountClass =
        isIncome
            ? "income"
            : "expense";


    const safeName =
        escapeHTML(
            transaction.name
        );


    const safeCategory =
        escapeHTML(
            transaction.category
        );


    const safeDate =
        formatDate(
            transaction.date
        );


    return `
        <div class="transaction-item">

            <div class="transaction-icon">
                <i class="${icon}"></i>
            </div>

            <div class="transaction-details">

                <strong>
                    ${safeName}
                </strong>

                <span>
                    ${safeCategory} • ${safeDate}
                </span>

            </div>

            <div class="transaction-amount ${amountClass}">
                ${sign}${formatCurrency(transaction.amount)}
            </div>

        </div>
    `;
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   CATEGORY ICONS
   ========================================================= */

function getCategoryIcon(category) {

    const icons = {
        Food:
            "fa-solid fa-utensils",

        Transport:
            "fa-solid fa-car",

        Shopping:
            "fa-solid fa-bag-shopping",

        Bills:
            "fa-solid fa-lightbulb",

        Entertainment:
            "fa-solid fa-gamepad",

        Education:
            "fa-solid fa-book",

        Health:
            "fa-solid fa-heart-pulse",

        Other:
            "fa-solid fa-box"
    };


    return (
        icons[category] ||
        icons.Other
    );
}


/* =========================================================
   CHART
   ========================================================= */

function updateChart() {

    const canvas =
        getElement("expenseChart");

    const emptyChart =
        getElement("emptyChart");


    if (!canvas) {
        return;
    }


    const data =
        calculateMonthlyData();


    if (!data.expense) {

        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }


        canvas.style.display =
            "none";


        if (emptyChart) {
            emptyChart.style.display =
                "flex";
        }


        return;
    }


    canvas.style.display =
        "block";


    if (emptyChart) {
        emptyChart.style.display =
            "none";
    }


    const filter =
        getElement("chartFilter");


    const chartType =
        filter
            ? filter.value
            : "category";


    let labels = [];
    let values = [];


    if (chartType === "weekly") {

        const weekly =
            getWeeklyExpenses(
                data.transactions
            );


        labels =
            weekly.labels;

        values =
            weekly.values;

    } else {

        const categories =
            getCategoryExpenses(
                data.transactions
            );


        labels =
            categories.labels;

        values =
            categories.values;
    }


    if (
        typeof Chart === "undefined"
    ) {
        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    if (expenseChart) {
        expenseChart.destroy();
    }


    const context =
        canvas.getContext("2d");


    expenseChart =
        new Chart(
            context,
            {
                type:
                    chartType === "weekly"
                        ? "bar"
                        : "doughnut",

                data: {
                    labels: labels,

                    datasets: [
                        {
                            label:
                                "Expenses",

                            data:
                                values,

                            borderWidth:
                                2
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {
                        legend: {
                            position:
                                "bottom"
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    function (
                                        context
                                    ) {
                                        const value =
                                            context.raw ||
                                            0;

                                        return ` ${formatCurrency(
                                            value
                                        )}`;
                                    }
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   CATEGORY CHART DATA
   ========================================================= */

function getCategoryExpenses(
    monthlyTransactions
) {

    const totals = {};


    monthlyTransactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(
            transaction => {

                const category =
                    transaction.category ||
                    "Other";


                totals[category] =
                    (
                        totals[category] ||
                        0
                    ) +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    );
            }
        );


    return {
        labels:
            Object.keys(totals),

        values:
            Object.values(totals)
    };
}


/* =========================================================
   WEEKLY CHART DATA
   ========================================================= */

function getWeeklyExpenses(
    monthlyTransactions
) {

    const weeks = [
        0,
        0,
        0,
        0,
        0
    ];


    monthlyTransactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(
            transaction => {

                const date =
                    new Date(
                        `${transaction.date}T00:00:00`
                    );


                const day =
                    date.getDate();


                const week =
                    Math.min(
                        Math.floor(
                            (day - 1) / 7
                        ),
                        4
                    );


                weeks[week] +=
                    Number(
                        transaction.amount
                    ) || 0;
            }
        );


    return {
        labels: [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4",
            "Week 5"
        ],

        values: weeks
    };
}


/* =========================================================
   AI INSIGHT
   ========================================================= */

function updateAIInsight(data) {

    const title =
        getElement("aiInsightTitle");

    const text =
        getElement("aiInsightText");


    if (!title || !text) {
        return;
    }


    if (
        data.income === 0 &&
        data.expense === 0
    ) {

        title.textContent =
            "Your financial assistant is ready.";

        text.textContent =
            "Add some transactions and I'll analyze your spending habits, budget and savings opportunities.";

        return;
    }


    if (data.income === 0) {

        title.textContent =
            "Add your income to get better insights.";

        text.textContent =
            `You've recorded ${formatCurrency(
                data.expense
            )} in expenses this month. Add your income so FinTrack can calculate your savings rate.`;

        return;
    }


    const savingsRate =
        data.savingsPercentage;


    if (data.expense > data.income) {

        title.textContent =
            "Your expenses are higher than your income.";

        text.textContent =
            `You've spent ${formatCurrency(
                data.expense
            )} while earning ${formatCurrency(
                data.income
            )}. Try reducing non-essential spending.`;

        return;
    }


    if (savingsRate >= 30) {

        title.textContent =
            "Excellent saving habit! 🎉";

        text.textContent =
            `You're saving around ${savingsRate.toFixed(
                1
            )}% of your income this month. Keep maintaining this healthy financial habit.`;

        return;
    }


    if (savingsRate >= 20) {

        title.textContent =
            "You're on a good track 👍";

        text.textContent =
            `You're currently saving ${savingsRate.toFixed(
                1
            )}% of your income. A little more optimization could help you save even more.`;

        return;
    }


    if (savingsRate >= 10) {

        title.textContent =
            "There is room to improve your savings.";

        text.textContent =
            `Your current savings rate is ${savingsRate.toFixed(
                1
            )}%. Consider reviewing your largest expense categories.`;

        return;
    }


    title.textContent =
        "Let's improve your savings.";

    text.textContent =
        `You're saving only ${savingsRate.toFixed(
            1
        )}% of your income. Try cutting one or two unnecessary expenses this month.`;
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;


function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        getElement("toast");

    const toastTitle =
        getElement("toastTitle");

    const toastMessage =
        getElement("toastMessage");


    if (
        !toast ||
        !toastTitle ||
        !toastMessage
    ) {
        return;
    }


    toastTitle.textContent =
        title;

    toastMessage.textContent =
        message;


    toast.dataset.type =
        type;


    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(
            hideToast,
            3500
        );
}


function hideToast() {

    const toast =
        getElement("toast");


    if (toast) {
        toast.classList.remove("show");
    }
}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

function deleteTransaction(id) {

    const index =
        transactions.findIndex(
            transaction =>
                String(transaction.id) ===
                String(id)
        );


    if (index === -1) {
        return false;
    }


    transactions.splice(
        index,
        1
    );


    const saved =
        saveTransactions();


    if (saved) {
        updateDashboard();

        showToast(
            "Transaction Deleted",
            "The transaction has been removed."
        );
    }


    return saved;
}


/* =========================================================
   UPDATE TRANSACTION
   ========================================================= */

function updateTransaction(
    id,
    updatedData
) {

    const index =
        transactions.findIndex(
            transaction =>
                String(transaction.id) ===
                String(id)
        );


    if (index === -1) {
        return false;
    }


    transactions[index] = {
        ...transactions[index],
        ...updatedData
    };


    const saved =
        saveTransactions();


    if (saved) {
        updateDashboard();

        showToast(
            "Transaction Updated",
            "Your transaction has been updated."
        );
    }


    return saved;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   PUBLIC API
   Useful for other pages
   ========================================================= */

window.FinTrack = {

    getTransactions: () =>
        [...transactions],

    getBudget: () =>
        ({ ...budget }),

    getMonthlyTransactions:
        () =>
            getMonthlyTransactions(),

    addTransaction:
        transaction => {

            const newTransaction = {
                id:
                    generateID(),

                type:
                    transaction.type ||
                    "expense",

                name:
                    transaction.name ||
                    "Untitled",

                amount:
                    Number(
                        transaction.amount
                    ) || 0,

                category:
                    transaction.category ||
                    "Other",

                date:
                    transaction.date ||
                    getTodayString(),

                paymentMethod:
                    transaction.paymentMethod ||
                    "Other",

                notes:
                    transaction.notes ||
                    "",

                createdAt:
                    new Date().toISOString()
            };


            transactions.unshift(
                newTransaction
            );


            saveTransactions();
            updateDashboard();


            return newTransaction;
        },

    deleteTransaction:
        deleteTransaction,

    updateTransaction:
        updateTransaction,

    saveBudget:
        saveBudget,

    formatCurrency:
        formatCurrency,

    showToast:
        showToast,

    updateDashboard:
        updateDashboard,

    openModal:
        openModal,

    closeModal:
        closeModal
};


/* =========================================================
   END OF FINTRACK SCRIPT
   ========================================================= */