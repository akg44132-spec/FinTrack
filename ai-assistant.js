/* =========================================================
   FINTRACK - AI ASSISTANT
   Smart Financial Assistant
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
   ========================================================= */

const AI_STORAGE_KEY =
    "fintrack_transactions";


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAI();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeAI() {

    setupChatEvents();

    updateFinancialSnapshot();

}


/* =========================================================
   CHAT EVENTS
   ========================================================= */

function setupChatEvents() {

    const form =
        document.getElementById(
            "chatForm"
        );


    const input =
        document.getElementById(
            "chatInput"
        );


    const clearButton =
        document.getElementById(
            "clearChat"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const question =
                    input
                        ? input.value.trim()
                        : "";

                if (!question) {

                    return;

                }

                input.value = "";

                sendQuestion(
                    question
                );

            }
        );

    }


    /*
     * Quick questions
     */

    const quickButtons =
        document.querySelectorAll(
            "[data-question]"
        );


    quickButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const question =
                        this.dataset.question;


                    if (!question) {

                        return;

                    }


                    sendQuestion(
                        question
                    );

                }
            );

        }
    );


    /*
     * Clear chat
     */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearChat
        );

    }


    /*
     * Mobile menu
     */

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (
        mobileMenu &&
        sidebar
    ) {

        mobileMenu.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /*
     * Enter key
     */

    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    form?.dispatchEvent(
                        new Event(
                            "submit"
                        )
                    );

                }

            }
        );

    }

}


/* =========================================================
   SEND QUESTION
   ========================================================= */

function sendQuestion(
    question
) {

    addMessage(
        "user",
        escapeHTML(
            question
        )
    );


    showTyping();


    setTimeout(
        function () {

            hideTyping();


            const answer =
                generateAIResponse(
                    question
                );


            addMessage(
                "ai",
                answer
            );


            updateFinancialSnapshot();

        },
        650
    );

}


/* =========================================================
   GET TRANSACTIONS
   ========================================================= */

function getAITransactions() {

    try {

        const data =
            localStorage.getItem(
                AI_STORAGE_KEY
            );


        if (!data) {

            return [];

        }


        const transactions =
            JSON.parse(
                data
            );


        return Array.isArray(
            transactions
        )
            ? transactions
            : [];

    } catch (error) {

        console.error(
            "AI transaction error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GENERATE AI RESPONSE
   ========================================================= */

function generateAIResponse(
    question
) {

    const transactions =
        getAITransactions();


    const normalized =
        question
            .toLowerCase()
            .trim();


    const income =
        getTotal(
            transactions,
            "income"
        );


    const expenses =
        getTotal(
            transactions,
            "expense"
        );


    const savings =
        income -
        expenses;


    /*
     * No data
     */

    if (
        transactions.length ===
        0
    ) {

        return `

            <strong>I'm ready to help! 🤖</strong>

            <br><br>

            But I don't have any transaction
            data yet.

            <br><br>

            Start by adding some income and
            expense transactions from the
            <strong>Transactions</strong> page.

            <br><br>

            Once you add them, I can analyze
            your spending, savings and
            financial habits.

        `;

    }


    /*
     * Biggest expense
     */

    if (
        containsAny(
            normalized,
            [
                "where am i spending",
                "spending the most",
                "biggest expense",
                "highest expense",
                "most expense",
                "largest expense",
                "top spending"
            ]
        )
    ) {

        return generateBiggestExpenseResponse(
            transactions,
            expenses
        );

    }


    /*
     * Save money
     */

    if (
        containsAny(
            normalized,
            [
                "save ₹5000",
                "save 5000",
                "save 5,000",
                "save money",
                "saving",
                "how can i save",
                "how to save"
            ]
        )
    ) {

        return generateSavingResponse(
            transactions,
            income,
            expenses,
            savings,
            normalized
        );

    }


    /*
     * Food
     */

    if (
        containsAny(
            normalized,
            [
                "food",
                "khana",
                "eating",
                "restaurant",
                "restaurants"
            ]
        )
    ) {

        return generateCategoryResponse(
            transactions,
            "Food"
        );

    }


    /*
     * Transport
     */

    if (
        containsAny(
            normalized,
            [
                "transport",
                "travel",
                "travelling",
                "petrol",
                "fuel"
            ]
        )
    ) {

        return generateCategoryResponse(
            transactions,
            "Transport"
        );

    }


    /*
     * Shopping
     */

    if (
        containsAny(
            normalized,
            [
                "shopping",
                "buying",
                "purchases",
                "purchase"
            ]
        )
    ) {

        return generateCategoryResponse(
            transactions,
            "Shopping"
        );

    }


    /*
     * Bills
     */

    if (
        containsAny(
            normalized,
            [
                "bill",
                "bills",
                "electricity",
                "recharge"
            ]
        )
    ) {

        return generateCategoryResponse(
            transactions,
            "Bills"
        );

    }


    /*
     * Income
     */

    if (
        containsAny(
            normalized,
            [
                "income",
                "earning",
                "earned",
                "salary",
                "kamaya",
                "kamai"
            ]
        )
    ) {

        return `

            Your recorded income is

            <strong>
                ${formatCurrency(
                    income
                )}
            </strong>.

            <br><br>

            You have recorded
            <strong>
                ${getCount(
                    transactions,
                    "income"
                )}
            </strong>
            income transaction(s).

            <br><br>

            Your total expenses are
            <strong>
                ${formatCurrency(
                    expenses
                )}
            </strong>.

        `;

    }


    /*
     * Expense
     */

    if (
        containsAny(
            normalized,
            [
                "expense",
                "expenses",
                "spent",
                "spending",
                "kharcha",
                "kharch"
            ]
        )
    ) {

        return `

            Your total recorded expenses are

            <strong>
                ${formatCurrency(
                    expenses
                )}
            </strong>.

            <br><br>

            You have made
            <strong>
                ${getCount(
                    transactions,
                    "expense"
                )}
            </strong>
            expense transaction(s).

            <br><br>

            Your biggest spending area is
            <strong>
                ${getTopCategory(
                    transactions
                ).name}
            </strong>.

        `;

    }


    /*
     * Financial health
     */

    if (
        containsAny(
            normalized,
            [
                "financial health",
                "health",
                "financial condition",
                "my finances",
                "how am i doing"
            ]
        )
    ) {

        return generateHealthResponse(
            income,
            expenses,
            savings
        );

    }


    /*
     * Analyze spending
     */

    if (
        containsAny(
            normalized,
            [
                "analyze",
                "analysis",
                "analyse",
                "spending habits",
                "spending pattern",
                "my spending"
            ]
        )
    ) {

        return generateAnalysisResponse(
            transactions,
            income,
            expenses,
            savings
        );

    }


    /*
     * Reduce expenses
     */

    if (
        containsAny(
            normalized,
            [
                "reduce expenses",
                "reduce my expenses",
                "cut expenses",
                "spend less",
                "control expenses",
                "kharcha kam"
            ]
        )
    ) {

        return generateReductionResponse(
            transactions,
            income,
            expenses
        );

    }


    /*
     * Monthly plan
     */

    if (
        containsAny(
            normalized,
            [
                "monthly plan",
                "financial plan",
                "budget plan",
                "monthly budget"
            ]
        )
    ) {

        return generatePlanResponse(
            income,
            expenses
        );

    }


    /*
     * Greeting
     */

    if (
        containsAny(
            normalized,
            [
                "hello",
                "hi",
                "hey",
                "hii",
                "namaste"
            ]
        )
    ) {

        return `

            Hey! 👋

            I'm ready to analyze your
            finances.

            <br><br>

            You can ask me things like:

            <br>

            • Where am I spending the most?

            <br>

            • How can I save ₹5,000?

            <br>

            • Analyze my spending habits.

            <br>

            • How is my financial health?

        `;

    }


    /*
     * Default response
     */

    return generateGeneralResponse(
        transactions,
        income,
        expenses,
        savings
    );

}


/* =========================================================
   BIGGEST EXPENSE RESPONSE
   ========================================================= */

function generateBiggestExpenseResponse(
    transactions,
    expenses
) {

    const top =
        getTopCategory(
            transactions
        );


    if (
        top.amount <= 0
    ) {

        return `

            I couldn't find any expense
            transactions yet.

            Add some expenses and I'll
            identify your biggest spending
            category.

        `;

    }


    const percentage =
        expenses > 0

            ? (
                top.amount /
                expenses
            ) * 100

            : 0;


    return `

        Your biggest spending category is

        <strong>
            ${escapeHTML(
                top.name
            )}
        </strong>.

        <br><br>

        You've spent

        <strong>
            ${formatCurrency(
                top.amount
            )}
        </strong>

        on it, which is approximately

        <strong>
            ${Math.round(
                percentage
            )}%
        </strong>

        of your total expenses.

        <br><br>

        💡 <strong>Tip:</strong>
        If you want to reduce your expenses,
        this is the first category I'd review.

    `;

}


/* =========================================================
   SAVING RESPONSE
   ========================================================= */

function generateSavingResponse(
    transactions,
    income,
    expenses,
    savings,
    question
) {

    const target =
        extractAmount(
            question
        ) || 5000;


    if (
        income <= 0
    ) {

        return `

            To create a ₹${formatNumber(
                target
            )} saving plan, I first need
            some income data.

            <br><br>

            Add your monthly income and
            expenses, then ask me again.

        `;

    }


    const categories =
        getSortedCategories(
            transactions
        );


    let tips =
        "";


    if (
        categories.length > 0
    ) {

        const top =
            categories[0];


        tips += `

            <br>
            • Focus first on
            <strong>
                ${escapeHTML(
                    top[0]
                )}
            </strong>,
            where you're spending
            ${formatCurrency(
                top[1]
            )}.

        `;

    }


    const requiredPerMonth =
        target;


    const currentSavingsRate =
        (
            savings /
            income
        ) * 100;


    return `

        You want to save

        <strong>
            ${formatCurrency(
                target
            )}
        </strong>.

        <br><br>

        Your current income is
        <strong>
            ${formatCurrency(
                income
            )}
        </strong>
        and your expenses are
        <strong>
            ${formatCurrency(
                expenses
            )}
        </strong>.

        <br><br>

        Your current savings are
        <strong>
            ${formatCurrency(
                savings
            )}
        </strong>
        (${Math.round(
            currentSavingsRate
        )}% of income).

        <br><br>

        🎯 <strong>Suggested approach:</strong>

        <br>

        1. Try to reduce unnecessary
        expenses by around
        <strong>
            ${formatCurrency(
                Math.min(
                    target,
                    expenses * 0.15
                )
            )}
        </strong>.

        <br>

        2. Keep your saving amount aside
        immediately after receiving income.

        <br>

        3. Avoid impulse purchases in your
        highest spending category.

        ${tips}

        <br><br>

        If you consistently redirect
        <strong>
            ${formatCurrency(
                requiredPerMonth
            )}
        </strong>
        towards savings each month,
        you'll reach ₹${formatNumber(
            target
        )} in approximately one month.

    `;

}


/* =========================================================
   CATEGORY RESPONSE
   ========================================================= */

function generateCategoryResponse(
    transactions,
    category
) {

    const amount =
        transactions
            .filter(
                function (transaction) {

                    return (
                        transaction.type ===
                        "expense" &&

                        String(
                            transaction.category
                        ).toLowerCase() ===
                        category.toLowerCase()
                    );

                }
            )
            .reduce(
                function (
                    total,
                    transaction
                ) {

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


    const count =
        transactions.filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "expense" &&

                    String(
                        transaction.category
                    ).toLowerCase() ===
                    category.toLowerCase()
                );

            }
        ).length;


    if (
        amount === 0
    ) {

        return `

            I couldn't find any expenses
            in the <strong>
            ${category}
            </strong> category.

            <br><br>

            If you add some ${category.toLowerCase()}
            transactions, I'll track them for you.

        `;

    }


    return `

        You've spent

        <strong>
            ${formatCurrency(
                amount
            )}
        </strong>

        on

        <strong>
            ${category}
        </strong>

        across

        <strong>
            ${count}
        </strong>
        transaction(s).

        <br><br>

        💡 If this category is taking a
        large portion of your budget,
        consider setting a monthly limit
        for it.

    `;

}


/* =========================================================
   HEALTH RESPONSE
   ========================================================= */

function generateHealthResponse(
    income,
    expenses,
    savings
) {

    if (
        income <= 0
    ) {

        return `

            I need some income data before
            I can evaluate your financial health.

            <br><br>

            Add your income and I'll calculate
            your savings rate and spending
            balance.

        `;

    }


    const rate =
        (
            savings /
            income
        ) * 100;


    if (
        rate >= 30
    ) {

        return `

            Your financial health looks

            <strong>
                excellent! 🚀
            </strong>

            <br><br>

            You're currently saving around

            <strong>
                ${Math.round(
                    rate
                )}%
            </strong>

            of your income.

            <br><br>

            Keep your spending controlled
            and continue building your
            savings.

        `;

    }


    if (
        rate >= 20
    ) {

        return `

            Your financial health looks

            <strong>
                good 👍
            </strong>.

            <br><br>

            Your savings rate is around

            <strong>
                ${Math.round(
                    rate
                )}%
            </strong>.

            <br><br>

            You're on the right track.
            Try gradually increasing your
            savings rate.

        `;

    }


    if (
        rate > 0
    ) {

        return `

            Your financial health is

            <strong>
                okay, but there's room
                for improvement.
            </strong>

            <br><br>

            You're saving around

            <strong>
                ${Math.round(
                    rate
                )}%
            </strong>

            of your income.

            <br><br>

            Try reducing unnecessary
            expenses and aim for a higher
            savings percentage.

        `;

    }


    return `

        ⚠️ Your expenses are currently
        equal to or higher than your income.

        <br><br>

        I'd recommend reviewing your
        biggest spending categories and
        reducing non-essential expenses.

    `;

}


/* =========================================================
   ANALYSIS RESPONSE
   ========================================================= */

function generateAnalysisResponse(
    transactions,
    income,
    expenses,
    savings
) {

    const top =
        getTopCategory(
            transactions
        );


    const rate =
        income > 0

            ? (
                savings /
                income
            ) * 100

            : 0;


    return `

        Here's your financial analysis 📊:

        <br><br>

        💰 <strong>Income:</strong>
        ${formatCurrency(
            income
        )}

        <br>

        💸 <strong>Expenses:</strong>
        ${formatCurrency(
            expenses
        )}

        <br>

        🏦 <strong>Savings:</strong>
        ${formatCurrency(
            savings
        )}

        <br>

        📈 <strong>Savings rate:</strong>
        ${Math.round(
            rate
        )}%

        <br>

        🏆 <strong>Top category:</strong>
        ${escapeHTML(
            top.name
        )}

        <br><br>

        ${getAnalysisMessage(
            rate,
            expenses,
            income
        )}

    `;

}


/* =========================================================
   REDUCTION RESPONSE
   ========================================================= */

function generateReductionResponse(
    transactions,
    income,
    expenses
) {

    const categories =
        getSortedCategories(
            transactions
        );


    if (
        categories.length ===
        0
    ) {

        return `

            I need some expense data before
            I can suggest where to cut costs.

        `;

    }


    const top =
        categories[0];


    const second =
        categories[1];


    return `

        To reduce your expenses, I'd start
        with these areas:

        <br><br>

        🥇 <strong>
        ${escapeHTML(
            top[0]
        )}
        </strong> —
        ${formatCurrency(
            top[1]
        )}

        ${
            second
                ? `<br>
                   🥈 <strong>
                   ${escapeHTML(
                       second[0]
                   )}
                   </strong> —
                   ${formatCurrency(
                       second[1]
                   )}`
                : ""
        }

        <br><br>

        💡 Try reducing discretionary
        spending in your top category by
        10–15%.

        <br><br>

        ${
            income > 0 &&
            expenses > income * 0.8

                ? "⚠️ Your expenses are above 80% of your income, so reducing unnecessary spending should be a priority."

                : "Your spending is relatively controlled. Small reductions can still improve your savings."
        }

    `;

}


/* =========================================================
   MONTHLY PLAN
   ========================================================= */

function generatePlanResponse(
    income,
    expenses
) {

    if (
        income <= 0
    ) {

        return `

            Add your monthly income first.
            Then I can create a personalized
            spending and savings plan.

        `;

    }


    const recommendedSavings =
        income * 0.20;


    const recommendedNeeds =
        income * 0.50;


    const recommendedWants =
        income * 0.30;


    return `

        Here's a simple monthly plan based
        on your income of

        <strong>
            ${formatCurrency(
                income
            )}
        </strong>:

        <br><br>

        🏦 <strong>Save:</strong>
        ${formatCurrency(
            recommendedSavings
        )}

        <br>

        🏠 <strong>Needs:</strong>
        ${formatCurrency(
            recommendedNeeds
        )}

        <br>

        🎯 <strong>Wants:</strong>
        ${formatCurrency(
            recommendedWants
        )}

        <br><br>

        Your current expenses are

        <strong>
            ${formatCurrency(
                expenses
            )}
        </strong>.

        <br><br>

        Use these numbers as a guideline,
        not a strict rule. Your actual plan
        should match your priorities.

    `;

}


/* =========================================================
   GENERAL RESPONSE
   ========================================================= */

function generateGeneralResponse(
    transactions,
    income,
    expenses,
    savings
) {

    const top =
        getTopCategory(
            transactions
        );


    return `

        I can help you analyze your finances
        using your FinTrack data. 🤖

        <br><br>

        Right now:

        <br>

        💰 Income:
        <strong>
            ${formatCurrency(
                income
            )}
        </strong>

        <br>

        💸 Expenses:
        <strong>
            ${formatCurrency(
                expenses
            )}
        </strong>

        <br>

        🏦 Savings:
        <strong>
            ${formatCurrency(
                savings
            )}
        </strong>

        <br>

        🏆 Top category:
        <strong>
            ${escapeHTML(
                top.name
            )}
        </strong>

        <br><br>

        Try asking:

        <br>

        <strong>
        "Where am I spending the most?"
        </strong>

        <br>

        <strong>
        "How can I save ₹5000?"
        </strong>

        <br>

        <strong>
        "Analyze my spending habits."
        </strong>

    `;

}


/* =========================================================
   ANALYSIS MESSAGE
   ========================================================= */

function getAnalysisMessage(
    rate,
    expenses,
    income
) {

    if (
        income <= 0
    ) {

        return "Add income data to get deeper insights.";

    }


    if (
        expenses >
        income
    ) {

        return `
            ⚠️ You're spending more than
            you're earning. Reducing
            unnecessary expenses should be
            your first priority.
        `;

    }


    if (
        rate >= 30
    ) {

        return `
            🚀 Excellent savings performance.
            Keep maintaining this habit and
            consider building an emergency fund.
        `;

    }


    if (
        rate >= 20
    ) {

        return `
            👍 Your finances are in a healthy
            position. Try gradually increasing
            your savings rate.
        `;

    }


    return `
        💡 Your savings rate could be improved.
        Review your biggest expense categories
        and look for areas where you can cut back.
    `;

}


/* =========================================================
   TOP CATEGORY
   ========================================================= */

function getTopCategory(
    transactions
) {

    const totals = {};


    transactions
        .filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "expense"
                );

            }
        )
        .forEach(
            function (transaction) {

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


    const entries =
        Object.entries(
            totals
        );


    if (
        entries.length ===
        0
    ) {

        return {

            name:
                "No expenses",

            amount:
                0

        };

    }


    entries.sort(
        function (a, b) {

            return b[1] - a[1];

        }
    );


    return {

        name:
            entries[0][0],

        amount:
            entries[0][1]

    };

}


/* =========================================================
   SORTED CATEGORIES
   ========================================================= */

function getSortedCategories(
    transactions
) {

    const totals = {};


    transactions
        .filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "expense"
                );

            }
        )
        .forEach(
            function (transaction) {

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


    return Object.entries(
        totals
    )
    .sort(
        function (a, b) {

            return b[1] - a[1];

        }
    );

}


/* =========================================================
   TOTAL
   ========================================================= */

function getTotal(
    transactions,
    type
) {

    return transactions
        .filter(
            function (transaction) {

                return (
                    transaction.type ===
                    type
                );

            }
        )
        .reduce(
            function (
                total,
                transaction
            ) {

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
   COUNT
   ========================================================= */

function getCount(
    transactions,
    type
) {

    return transactions.filter(
        function (transaction) {

            return (
                transaction.type ===
                type
            );

        }
    ).length;

}


/* =========================================================
   CONTAINS ANY
   ========================================================= */

function containsAny(
    text,
    words
) {

    return words.some(
        function (word) {

            return text.includes(
                word
            );

        }
    );

}


/* =========================================================
   EXTRACT AMOUNT
   ========================================================= */

function extractAmount(
    text
) {

    const cleaned =
        text
            .replace(
                /,/g,
                ""
            );


    const match =
        cleaned.match(
            /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i
        );


    if (!match) {

        return 0;

    }


    return (
        Number(
            match[1]
        ) || 0
    );

}


/* =========================================================
   FORMAT CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                0

        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            maximumFractionDigits:
                0

        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
    type,
    message
) {

    const chatBody =
        document.getElementById(
            "chatBody"
        );


    if (!chatBody) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        `message ${type}`;


    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "message-avatar";


    if (
        type ===
        "ai"
    ) {

        avatar.innerHTML =
            `<i class="
                fa-solid
                fa-robot
            "></i>`;

    } else {

        avatar.innerHTML =
            `<i class="
                fa-solid
                fa-user
            "></i>`;

    }


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    bubble.innerHTML =
        message;


    const time =
        document.createElement(
            "div"
        );


    time.className =
        "message-time";


    time.textContent =
        getCurrentTime();


    content.appendChild(
        bubble
    );


    content.appendChild(
        time
    );


    wrapper.appendChild(
        avatar
    );


    wrapper.appendChild(
        content
    );


    chatBody.appendChild(
        wrapper
    );


    scrollChatToBottom();

}


/* =========================================================
   TYPING
   ========================================================= */

function showTyping() {

    const message =
        document.getElementById(
            "typingMessage"
        );


    const typing =
        document.getElementById(
            "typing"
        );


    if (
        message &&
        typing
    ) {

        message.style.display =
            "flex";

        typing.style.display =
            "flex";

        scrollChatToBottom();

    }

}


function hideTyping() {

    const message =
        document.getElementById(
            "typingMessage"
        );


    const typing =
        document.getElementById(
            "typing"
        );


    if (
        message &&
        typing
    ) {

        message.style.display =
            "none";

        typing.style.display =
            "none";

    }

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollChatToBottom() {

    const chatBody =
        document.getElementById(
            "chatBody"
        );


    if (!chatBody) {

        return;

    }


    setTimeout(
        function () {

            chatBody.scrollTop =
                chatBody.scrollHeight;

        },
        50
    );

}


/* =========================================================
   CLEAR CHAT
   ========================================================= */

function clearChat() {

    const chatBody =
        document.getElementById(
            "chatBody"
        );


    if (!chatBody) {

        return;

    }


    chatBody.innerHTML = `

        <div class="message ai">

            <div class="message-avatar">

                <i class="
                    fa-solid
                    fa-robot
                "></i>

            </div>


            <div class="message-content">

                <div class="message-bubble">

                    Chat cleared! 👋

                    <br><br>

                    Ask me anything about
                    your finances.

                </div>


                <div class="message-time">
                    Just now
                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   CURRENT TIME
   ========================================================= */

function getCurrentTime() {

    return new Date()
        .toLocaleTimeString(
            "en-IN",
            {

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }
        );

}


/* =========================================================
   FINANCIAL SNAPSHOT
   ========================================================= */

function updateFinancialSnapshot() {

    const transactions =
        getAITransactions();


    const income =
        getTotal(
            transactions,
            "income"
        );


    const expenses =
        getTotal(
            transactions,
            "expense"
        );


    const savings =
        income -
        expenses;


    const rate =
        income > 0

            ? (
                savings /
                income
            ) * 100

            : 0;


    setText(
        "snapshotIncome",
        formatCurrency(
            income
        )
    );


    setText(
        "snapshotExpense",
        formatCurrency(
            expenses
        )
    );


    setText(
        "snapshotSavings",
        formatCurrency(
            savings
        )
    );


    setText(
        "snapshotRate",
        `${Math.round(
            rate
        )}%`
    );


    setText(
        "snapshotTransactions",
        transactions.length
    );


    /*
     * Savings target card
     */

    setText(
        "targetAmount",
        formatCurrency(
            Math.max(
                0,
                savings
            )
        )
    );


    const targetHelp =
        document.getElementById(
            "targetHelp"
        );


    if (
        targetHelp
    ) {

        if (
            savings >= 5000
        ) {

            targetHelp.textContent =
                "🎉 You've already saved ₹5,000 or more!";

        } else {

            const remaining =
                5000 -
                Math.max(
                    0,
                    savings
                );


            targetHelp.textContent =
                `You need ${formatCurrency(
                    remaining
                )} more to reach ₹5,000.`;

        }

    }

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
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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
   STORAGE CHANGE
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            AI_STORAGE_KEY
        ) {

            updateFinancialSnapshot();

        }

    }
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.FinTrackAI = {

    refresh:
        updateFinancialSnapshot,

    ask:
        sendQuestion,

    getTransactions:
        getAITransactions

};


/* =========================================================
   END
   ========================================================= */