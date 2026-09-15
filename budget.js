/* =========================================================
   FINTRACK - BUDGET.JS
   Budget Management
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const BUDGET_STORAGE_KEY =
    "fintrack_budget";

const TRANSACTIONS_STORAGE_KEY =
    "fintrack_transactions";


/* =========================================================
   STATE
   ========================================================= */

let budgetData = {

    min: 0,

    max: 0

};


let selectedBudgetMonth =
    new Date().getMonth();


let selectedBudgetYear =
    new Date().getFullYear();


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeBudgetPage();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeBudgetPage() {

    loadBudget();

    setCurrentMonth();

    loadBudgetInputs();

    setupBudgetEvents();

    updateBudgetPage();

}


/* =========================================================
   LOAD BUDGET
   ========================================================= */

function loadBudget() {

    try {

        const saved =
            localStorage.getItem(
                BUDGET_STORAGE_KEY
            );


        if (!saved) {

            budgetData = {

                min: 0,

                max: 0

            };

            return;

        }


        const parsed =
            JSON.parse(saved);


        budgetData = {

            min:
                Number(
                    parsed.min
                ) || 0,

            max:
                Number(
                    parsed.max
                ) || 0

        };

    } catch (error) {

        console.error(
            "Unable to load budget:",
            error
        );


        budgetData = {

            min: 0,

            max: 0

        };

    }

}


/* =========================================================
   SAVE BUDGET
   ========================================================= */

function saveBudget() {

    const minInput =
        document.getElementById(
            "minBudgetInput"
        );


    const maxInput =
        document.getElementById(
            "maxBudgetInput"
        );


    const min =
        minInput
            ? Number(
                minInput.value
            ) || 0
            : 0;


    const max =
        maxInput
            ? Number(
                maxInput.value
            ) || 0
            : 0;


    /*
     * VALIDATION
     */

    if (
        min < 0 ||
        max < 0
    ) {

        showBudgetToast(
            "Invalid Budget",
            "Budget values cannot be negative.",
            "error"
        );

        return;

    }


    if (
        max > 0 &&
        min > max
    ) {

        showBudgetToast(
            "Invalid Budget",
            "Minimum target cannot be greater than maximum budget.",
            "error"
        );

        return;

    }


    budgetData = {

        min: min,

        max: max

    };


    try {

        localStorage.setItem(
            BUDGET_STORAGE_KEY,
            JSON.stringify(
                budgetData
            )
        );

    } catch (error) {

        console.error(
            "Unable to save budget:",
            error
        );


        showBudgetToast(
            "Save Failed",
            "Unable to save your budget.",
            "error"
        );

        return;

    }


    /*
     * Update dashboard
     */

    if (
        window.FinTrack &&
        typeof window.FinTrack.updateDashboard ===
            "function"
    ) {

        window.FinTrack.updateDashboard();

    }


    updateBudgetPage();


    showBudgetToast(
        "Budget Saved",
        "Your monthly budget has been updated.",
        "success"
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupBudgetEvents() {


    const saveButton =
        document.getElementById(
            "saveBudgetBtn"
        );


    const monthSelect =
        document.getElementById(
            "budgetMonth"
        );


    const maxInput =
        document.getElementById(
            "maxBudgetInput"
        );


    const minInput =
        document.getElementById(
            "minBudgetInput"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveBudget
        );

    }


    if (monthSelect) {

        monthSelect.addEventListener(
            "change",
            function () {

                selectedBudgetMonth =
                    Number(
                        this.value
                    );

                updateBudgetPage();

            }
        );

    }


    /*
     * Live preview
     */

    if (maxInput) {

        maxInput.addEventListener(
            "input",
            updateBudgetPreview
        );

    }


    if (minInput) {

        minInput.addEventListener(
            "input",
            updateBudgetPreview
        );

    }


    /*
     * Enter key saves budget
     */

    [minInput, maxInput]
        .filter(Boolean)
        .forEach(
            function (input) {

                input.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            event.preventDefault();

                            saveBudget();

                        }

                    }
                );

            }
        );

}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function setCurrentMonth() {

    const monthSelect =
        document.getElementById(
            "budgetMonth"
        );


    if (!monthSelect) {

        return;

    }


    monthSelect.value =
        String(
            selectedBudgetMonth
        );

}


/* =========================================================
   LOAD INPUTS
   ========================================================= */

function loadBudgetInputs() {

    const minInput =
        document.getElementById(
            "minBudgetInput"
        );


    const maxInput =
        document.getElementById(
            "maxBudgetInput"
        );


    if (minInput) {

        minInput.value =
            budgetData.min ||
            "";

    }


    if (maxInput) {

        maxInput.value =
            budgetData.max ||
            "";

    }

}


/* =========================================================
   GET TRANSACTIONS
   ========================================================= */

function getBudgetTransactions() {

    try {

        const saved =
            localStorage.getItem(
                TRANSACTIONS_STORAGE_KEY
            );


        if (!saved) {

            return [];

        }


        const data =
            JSON.parse(saved);


        return Array.isArray(
            data
        )
            ? data
            : [];

    } catch (error) {

        console.error(
            "Unable to load transactions:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET MONTH EXPENSES
   ========================================================= */

function getMonthlyExpenses() {

    const transactions =
        getBudgetTransactions();


    return transactions
        .filter(
            function (transaction) {

                if (
                    transaction.type !==
                    "expense"
                ) {

                    return false;

                }


                if (
                    !transaction.date
                ) {

                    return false;

                }


                const date =
                    new Date(
                        transaction.date
                    );


                return (
                    date.getMonth() ===
                    selectedBudgetMonth &&

                    date.getFullYear() ===
                    selectedBudgetYear
                );

            }
        )
        .reduce(
            function (total, transaction) {

                return (
                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   GET MONTH TRANSACTION COUNT
   ========================================================= */

function getMonthlyExpenseCount() {

    const transactions =
        getBudgetTransactions();


    return transactions.filter(
        function (transaction) {

            if (
                transaction.type !==
                "expense"
            ) {

                return false;

            }


            const date =
                new Date(
                    transaction.date
                );


            return (
                date.getMonth() ===
                selectedBudgetMonth &&

                date.getFullYear() ===
                selectedBudgetYear
            );

        }
    ).length;

}


/* =========================================================
   UPDATE PAGE
   ========================================================= */

function updateBudgetPage() {


    const expenses =
        getMonthlyExpenses();


    const min =
        Number(
            budgetData.min
        ) || 0;


    const max =
        Number(
            budgetData.max
        ) || 0;


    updateSummaryCards(
        expenses,
        min,
        max
    );


    updateProgress(
        expenses,
        min,
        max
    );


    updateStatus(
        expenses,
        min,
        max
    );


    updateBadge(
        expenses,
        max
    );

}


/* =========================================================
   SUMMARY CARDS
   ========================================================= */

function updateSummaryCards(
    expenses,
    min,
    max
) {


    let remaining =
        max - expenses;


    if (
        max <= 0
    ) {

        remaining = 0;

    }


    let percentage =
        0;


    if (
        max > 0
    ) {

        percentage =
            (
                expenses /
                max
            ) *
            100;

    }


    setText(
        "summaryMaxBudget",
        formatCurrency(max)
    );


    setText(
        "summarySpent",
        formatCurrency(expenses)
    );


    setText(
        "summaryRemaining",
        formatCurrency(
            Math.abs(
                remaining
            )
        )
    );


    setText(
        "summaryPercentage",
        `${Math.round(
            Math.max(
                percentage,
                0
            )
        )}%`
    );


    const remainingText =
        document.getElementById(
            "summaryRemainingText"
        );


    if (remainingText) {

        if (
            max <= 0
        ) {

            remainingText.textContent =
                "Set a maximum budget";

            remainingText.style.color =
                "#737d93";

        } else if (
            remaining < 0
        ) {

            remainingText.textContent =
                "Over your spending limit";

            remainingText.style.color =
                "#ff5c85";

        } else {

            remainingText.textContent =
                "Available to spend";

            remainingText.style.color =
                "#737d93";

        }

    }

}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress(
    expenses,
    min,
    max
) {


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    const percentageText =
        document.getElementById(
            "budgetPercentage"
        );


    const spentText =
        document.getElementById(
            "spentAmount"
        );


    const remainingText =
        document.getElementById(
            "remainingAmount"
        );


    let percentage =
        0;


    if (
        max > 0
    ) {

        percentage =
            (
                expenses /
                max
            ) *
            100;

    }


    const visualPercentage =
        Math.min(
            Math.max(
                percentage,
                0
            ),
            100
        );


    /*
     * Width
     */

    if (progress) {

        progress.style.width =
            `${visualPercentage}%`;


        progress.classList.remove(
            "warning",
            "danger"
        );


        if (
            percentage >= 100
        ) {

            progress.classList.add(
                "danger"
            );

        } else if (
            percentage >= 80
        ) {

            progress.classList.add(
                "warning"
            );

        }

    }


    /*
     * Percentage
     */

    if (percentageText) {

        percentageText.textContent =
            `${Math.round(
                Math.max(
                    percentage,
                    0
                )
            )}%`;

    }


    /*
     * Spent
     */

    if (spentText) {

        spentText.textContent =
            `${formatCurrency(
                expenses
            )} spent`;

    }


    /*
     * Remaining
     */

    if (remainingText) {

        if (
            max <= 0
        ) {

            remainingText.textContent =
                "No limit set";

            remainingText.classList.remove(
                "remaining",
                "over"
            );

        } else if (
            expenses > max
        ) {

            remainingText.textContent =
                `${formatCurrency(
                    expenses - max
                )} over limit`;

            remainingText.classList.remove(
                "remaining"
            );

            remainingText.classList.add(
                "over"
            );

        } else {

            remainingText.textContent =
                `${formatCurrency(
                    max - expenses
                )} remaining`;

            remainingText.classList.remove(
                "over"
            );

            remainingText.classList.add(
                "remaining"
            );

        }

    }

}


/* =========================================================
   STATUS
   ========================================================= */

function updateStatus(
    expenses,
    min,
    max
) {


    const status =
        document.getElementById(
            "budgetStatus"
        );


    if (!status) {

        return;

    }


    const icon =
        status.querySelector(
            "i"
        );


    const text =
        status.querySelector(
            "span"
        );


    status.classList.remove(
        "warning",
        "danger"
    );


    /*
     * NO MAX
     */

    if (
        max <= 0
    ) {

        if (icon) {

            icon.className =
                "fa-solid fa-circle-info";

        }


        if (text) {

            text.textContent =
                "Set a maximum budget to start tracking your spending.";

        }


        status.classList.add(
            "warning"
        );


        return;

    }


    /*
     * OVER BUDGET
     */

    if (
        expenses > max
    ) {

        if (icon) {

            icon.className =
                "fa-solid fa-circle-exclamation";

        }


        if (text) {

            text.textContent =
                `You've exceeded your maximum budget by ${formatCurrency(
                    expenses - max
                )}.`;

        }


        status.classList.add(
            "danger"
        );


        return;

    }


    /*
     * 80% WARNING
     */

    if (
        expenses >=
        max * 0.8
    ) {

        if (icon) {

            icon.className =
                "fa-solid fa-triangle-exclamation";

        }


        if (text) {

            text.textContent =
                "You're getting close to your maximum spending limit.";

        }


        status.classList.add(
            "warning"
        );


        return;

    }


    /*
     * BELOW MINIMUM
     */

    if (
        min > 0 &&
        expenses < min
    ) {

        if (icon) {

            icon.className =
                "fa-solid fa-circle-info";

        }


        if (text) {

            text.textContent =
                `Your spending is below your minimum target of ${formatCurrency(
                    min
                )}.`;

        }


        status.classList.add(
            "warning"
        );


        return;

    }


    /*
     * NORMAL
     */

    if (icon) {

        icon.className =
            "fa-solid fa-circle-check";

    }


    if (text) {

        text.textContent =
            "You're within your budget.";

    }

}


/* =========================================================
   BADGE
   ========================================================= */

function updateBadge(
    expenses,
    max
) {


    const badge =
        document.getElementById(
            "budgetBadge"
        );


    if (!badge) {

        return;

    }


    badge.style.background = "";

    badge.style.color = "";


    if (
        max <= 0
    ) {

        badge.textContent =
            "Not Set";

        badge.style.background =
            "rgba(255,200,87,0.10)";

        badge.style.color =
            "#ffc857";

        return;

    }


    if (
        expenses > max
    ) {

        badge.textContent =
            "Over Budget";

        badge.style.background =
            "rgba(255,92,133,0.10)";

        badge.style.color =
            "#ff5c85";

        return;

    }


    if (
        expenses >=
        max * 0.8
    ) {

        badge.textContent =
            "Near Limit";

        badge.style.background =
            "rgba(255,200,87,0.10)";

        badge.style.color =
            "#ffc857";

        return;

    }


    badge.textContent =
        "Within Budget";

    badge.style.background =
        "rgba(25,217,154,0.10)";

    badge.style.color =
        "#19d99a";

}


/* =========================================================
   LIVE PREVIEW
   ========================================================= */

function updateBudgetPreview() {


    const minInput =
        document.getElementById(
            "minBudgetInput"
        );


    const maxInput =
        document.getElementById(
            "maxBudgetInput"
        );


    const min =
        minInput
            ? Number(
                minInput.value
            ) || 0
            : 0;


    const max =
        maxInput
            ? Number(
                maxInput.value
            ) || 0
            : 0;


    const expenses =
        getMonthlyExpenses();


    updateSummaryCards(
        expenses,
        min,
        max
    );


    updateProgress(
        expenses,
        min,
        max
    );


    updateStatus(
        expenses,
        min,
        max
    );


    updateBadge(
        expenses,
        max
    );

}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {


    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showBudgetToast(
    title,
    message,
    type = "success"
) {


    /*
     * Existing FinTrack toast
     */

    if (
        window.FinTrack &&
        typeof window.FinTrack.showToast ===
            "function"
    ) {

        window.FinTrack.showToast(
            title,
            message,
            type
        );

        return;

    }


    /*
     * Console fallback
     */

    console.log(
        `[${type}] ${title}: ${message}`
    );

}


/* =========================================================
   STORAGE LISTENER
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {


        if (
            event.key ===
            TRANSACTIONS_STORAGE_KEY
        ) {

            updateBudgetPage();

        }


        if (
            event.key ===
            BUDGET_STORAGE_KEY
        ) {

            loadBudget();

            loadBudgetInputs();

            updateBudgetPage();

        }

    }
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.FinTrackBudget = {

    refresh:
        updateBudgetPage,

    getBudget:
        function () {

            return {
                ...budgetData
            };

        },

    getMonthlyExpenses:
        getMonthlyExpenses,

    save:
        saveBudget

};


/* =========================================================
   END
   ========================================================= */