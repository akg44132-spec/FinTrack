/* =========================================================
   FINTRACK - TRANSACTIONS.JS
   Complete Transactions Page
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
   ========================================================= */

const TRANSACTION_STORAGE_KEY =
    "fintrack_transactions";


/* =========================================================
   STATE
   ========================================================= */

let transactionState = {

    search: "",

    type: "all",

    category: "all",

    sort: "newest",

    editingId: null
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTransactionsPage();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeTransactionsPage() {

    setTodayDate();

    setupFilters();

    setupButtons();

    setupModal();

    setupTransactionForm();

    renderTransactionsPage();

}


/* =========================================================
   GET TRANSACTIONS
   ========================================================= */

function getTransactions() {

    try {

        const saved =
            localStorage.getItem(
                TRANSACTION_STORAGE_KEY
            );


        if (!saved) {

            return [];

        }


        const data =
            JSON.parse(saved);


        if (!Array.isArray(data)) {

            return [];

        }


        return data;

    } catch (error) {

        console.error(
            "Error loading transactions:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE TRANSACTIONS
   ========================================================= */

function saveTransactions(
    transactions
) {

    try {

        localStorage.setItem(
            TRANSACTION_STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {

        console.error(
            "Error saving transactions:",
            error
        );

        return false;

    }

}


/* =========================================================
   FILTER SETUP
   ========================================================= */

function setupFilters() {


    const search =
        document.getElementById(
            "transactionSearch"
        );


    const type =
        document.getElementById(
            "transactionTypeFilter"
        );


    const category =
        document.getElementById(
            "transactionCategoryFilter"
        );


    const sort =
        document.getElementById(
            "transactionSort"
        );


    if (search) {

        search.addEventListener(
            "input",
            function () {

                transactionState.search =
                    this.value
                        .trim()
                        .toLowerCase();

                renderTransactionsPage();

            }
        );

    }


    if (type) {

        type.addEventListener(
            "change",
            function () {

                transactionState.type =
                    this.value;

                renderTransactionsPage();

            }
        );

    }


    if (category) {

        category.addEventListener(
            "change",
            function () {

                transactionState.category =
                    this.value;

                renderTransactionsPage();

            }
        );

    }


    if (sort) {

        sort.addEventListener(
            "change",
            function () {

                transactionState.sort =
                    this.value;

                renderTransactionsPage();

            }
        );

    }

}


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons() {


    const addButton =
        document.getElementById(
            "addTransactionBtn"
        );


    const emptyButton =
        document.getElementById(
            "emptyTransactionBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                openTransactionModal();

            }
        );

    }


    if (emptyButton) {

        emptyButton.addEventListener(
            "click",
            function () {

                openTransactionModal();

            }
        );

    }

}


/* =========================================================
   MODAL SETUP
   ========================================================= */

function setupModal() {


    const closeButton =
        document.getElementById(
            "closeModal"
        );


    const modal =
        document.getElementById(
            "transactionModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                closeTransactionModal();

            }
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeTransactionModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeTransactionModal();

            }

        }
    );

}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openTransactionModal(
    transaction = null
) {


    const modal =
        document.getElementById(
            "transactionModal"
        );


    const form =
        document.getElementById(
            "transactionForm"
        );


    const title =
        document.getElementById(
            "transactionModalTitle"
        );


    const submitButton =
        document.getElementById(
            "transactionSubmitBtn"
        );


    if (!modal || !form) {

        return;

    }


    /*
     * RESET
     */

    form.reset();


    transactionState.editingId =
        null;


    setTodayDate();


    /*
     * ADD MODE
     */

    if (!transaction) {

        if (title) {

            title.textContent =
                "Add Transaction";

        }


        updateSubmitButton(
            false
        );


        setTransactionType(
            "expense"
        );


    }


    /*
     * EDIT MODE
     */

    else {

        transactionState.editingId =
            transaction.id;


        if (title) {

            title.textContent =
                "Edit Transaction";

        }


        updateSubmitButton(
            true
        );


        fillTransactionForm(
            transaction
        );

    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            const nameInput =
                document.getElementById(
                    "transactionName"
                );

            if (nameInput) {

                nameInput.focus();

            }

        },
        150
    );

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeTransactionModal() {


    const modal =
        document.getElementById(
            "transactionModal"
        );


    const form =
        document.getElementById(
            "transactionForm"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.style.overflow =
        "";


    if (form) {

        form.reset();

    }


    transactionState.editingId =
        null;


    setTodayDate();


    setTransactionType(
        "expense"
    );


    updateSubmitButton(
        false
    );

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupTransactionForm() {


    const form =
        document.getElementById(
            "transactionForm"
        );


    if (!form) {

        return;

    }


    /*
     * CAPTURE PHASE
     *
     * This prevents the old script.js
     * submit handler from creating a
     * duplicate transaction.
     */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            handleTransactionSubmit();

        },
        true
    );


    /*
     * TYPE RADIO
     */

    const typeInputs =
        document.querySelectorAll(
            'input[name="transactionType"]'
        );


    typeInputs.forEach(
        function (input) {

            input.addEventListener(
                "change",
                function () {

                    updateTypeSelector();

                }
            );

        }
    );

}


/* =========================================================
   SUBMIT TRANSACTION
   ========================================================= */

function handleTransactionSubmit() {


    const nameInput =
        document.getElementById(
            "transactionName"
        );


    const amountInput =
        document.getElementById(
            "transactionAmount"
        );


    const categoryInput =
        document.getElementById(
            "transactionCategory"
        );


    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    const paymentInput =
        document.getElementById(
            "paymentMethod"
        );


    const notesInput =
        document.getElementById(
            "transactionNotes"
        );


    const typeInput =
        document.querySelector(
            'input[name="transactionType"]:checked'
        );


    /*
     * VALUES
     */

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const amount =
        amountInput
            ? Number(amountInput.value)
            : 0;


    const category =
        categoryInput
            ? categoryInput.value
            : "";


    const date =
        dateInput
            ? dateInput.value
            : "";


    const paymentMethod =
        paymentInput
            ? paymentInput.value
            : "UPI";


    const notes =
        notesInput
            ? notesInput.value.trim()
            : "";


    const type =
        typeInput
            ? typeInput.value
            : "expense";


    /*
     * VALIDATION
     */

    if (!name) {

        showToastMessage(
            "Name Required",
            "Please enter a transaction description.",
            "error"
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        showToastMessage(
            "Invalid Amount",
            "Please enter a valid amount.",
            "error"
        );

        return;

    }


    if (!category) {

        showToastMessage(
            "Category Required",
            "Please select a category.",
            "error"
        );

        return;

    }


    if (!date) {

        showToastMessage(
            "Date Required",
            "Please select a date.",
            "error"
        );

        return;

    }


    /*
     * LOAD CURRENT DATA
     */

    let transactions =
        getTransactions();


    /*
     * EDIT
     */

    if (
        transactionState.editingId
    ) {

        const index =
            transactions.findIndex(
                function (transaction) {

                    return String(
                        transaction.id
                    ) === String(
                        transactionState.editingId
                    );

                }
            );


        if (index === -1) {

            showToastMessage(
                "Error",
                "Transaction could not be found.",
                "error"
            );

            return;

        }


        transactions[index] = {

            ...transactions[index],

            type: type,

            name: name,

            amount: amount,

            category: category,

            date: date,

            paymentMethod:
                paymentMethod,

            notes: notes

        };


        const saved =
            saveTransactions(
                transactions
            );


        if (!saved) {

            showToastMessage(
                "Error",
                "Unable to save transaction.",
                "error"
            );

            return;

        }


        closeTransactionModal();


        renderTransactionsPage();


        showToastMessage(
            "Transaction Updated",
            "Transaction updated successfully.",
            "success"
        );


        return;

    }


    /*
     * ADD NEW TRANSACTION
     */

    const transaction = {

        id:
            generateTransactionId(),

        type:
            type,

        name:
            name,

        amount:
            amount,

        category:
            category,

        date:
            date,

        paymentMethod:
            paymentMethod,

        notes:
            notes,

        createdAt:
            new Date().toISOString()

    };


    /*
     * ADD TO BEGINNING
     */

    transactions.unshift(
        transaction
    );


    /*
     * SAVE
     */

    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {

        showToastMessage(
            "Error",
            "Unable to save transaction.",
            "error"
        );

        return;

    }


    closeTransactionModal();


    renderTransactionsPage();


    showToastMessage(
        "Transaction Added",
        `${
            type === "income"
                ? "Income"
                : "Expense"
        } added successfully.`,
        "success"
    );

}


/* =========================================================
   GENERATE ID
   ========================================================= */

function generateTransactionId() {

    return (
        Date.now().toString() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderTransactionsPage() {


    const allTransactions =
        getTransactions();


    /*
     * SUMMARY
     */

    updateSummary(
        allTransactions
    );


    /*
     * CATEGORY FILTER
     */

    updateCategoryFilter(
        allTransactions
    );


    /*
     * FILTER
     */

    let filtered =
        filterTransactions(
            allTransactions
        );


    /*
     * SORT
     */

    filtered =
        sortTransactions(
            filtered
        );


    /*
     * TABLE
     */

    renderTransactionTable(
        filtered
    );


    /*
     * COUNT
     */

    updateResultCount(
        filtered.length,
        allTransactions.length
    );

}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateSummary(
    transactions
) {


    let income = 0;

    let expenses = 0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            } else {

                expenses += amount;

            }

        }
    );


    const balance =
        income - expenses;


    setText(
        "totalTransactions",
        transactions.length
    );


    setText(
        "totalIncome",
        formatCurrency(income)
    );


    setText(
        "totalExpenses",
        formatCurrency(expenses)
    );


    setText(
        "netBalance",
        formatCurrency(balance)
    );

}


/* =========================================================
   UPDATE CATEGORY FILTER
   ========================================================= */

function updateCategoryFilter(
    transactions
) {


    const select =
        document.getElementById(
            "transactionCategoryFilter"
        );


    if (!select) {

        return;

    }


    const selected =
        transactionState.category;


    const categories =
        [
            ...new Set(
                transactions
                    .map(
                        function (transaction) {

                            return transaction.category;

                        }
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = "";


    const allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "all";


    allOption.textContent =
        "All Categories";


    select.appendChild(
        allOption
    );


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            selected
        )
    ) {

        select.value =
            selected;

    } else {

        select.value =
            "all";

        transactionState.category =
            "all";

    }

}


/* =========================================================
   FILTER TRANSACTIONS
   ========================================================= */

function filterTransactions(
    transactions
) {


    return transactions.filter(
        function (transaction) {


            /*
             * SEARCH
             */

            const search =
                transactionState.search;


            if (search) {

                const searchableText =
                    [
                        transaction.name,
                        transaction.category,
                        transaction.paymentMethod,
                        transaction.notes
                    ]
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchableText.includes(
                        search
                    )
                ) {

                    return false;

                }

            }


            /*
             * TYPE
             */

            if (
                transactionState.type !==
                "all"
            ) {

                if (
                    transaction.type !==
                    transactionState.type
                ) {

                    return false;

                }

            }


            /*
             * CATEGORY
             */

            if (
                transactionState.category !==
                "all"
            ) {

                if (
                    transaction.category !==
                    transactionState.category
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   SORT
   ========================================================= */

function sortTransactions(
    transactions
) {


    const sorted =
        [...transactions];


    switch (
        transactionState.sort
    ) {


        case "oldest":

            sorted.sort(
                function (a, b) {

                    return (
                        getDateValue(a.date) -
                        getDateValue(b.date)
                    );

                }
            );

            break;


        case "highest":

            sorted.sort(
                function (a, b) {

                    return (
                        Number(b.amount || 0) -
                        Number(a.amount || 0)
                    );

                }
            );

            break;


        case "lowest":

            sorted.sort(
                function (a, b) {

                    return (
                        Number(a.amount || 0) -
                        Number(b.amount || 0)
                    );

                }
            );

            break;


        case "newest":

        default:

            sorted.sort(
                function (a, b) {

                    return (
                        getDateValue(b.date) -
                        getDateValue(a.date)
                    );

                }
            );

            break;

    }


    return sorted;

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderTransactionTable(
    transactions
) {


    const tbody =
        document.getElementById(
            "transactionsTableBody"
        );


    const emptyState =
        document.getElementById(
            "transactionsEmpty"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


    /*
     * EMPTY
     */

    if (
        transactions.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    /*
     * ROWS
     */

    transactions.forEach(
        function (transaction) {


            const row =
                document.createElement(
                    "tr"
                );


            const type =
                transaction.type ===
                "income"
                    ? "income"
                    : "expense";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            const sign =
                type === "income"
                    ? "+"
                    : "-";


            row.innerHTML = `

                <td>

                    <div class="transaction-name-wrapper">

                        <div class="transaction-category-icon">

                            ${getCategoryIcon(
                                transaction.category
                            )}

                        </div>


                        <div class="transaction-name-info">

                            <span class="transaction-name">

                                ${escapeHTML(
                                    transaction.name ||
                                    "Unnamed"
                                )}

                            </span>


                            <span class="transaction-payment">

                                ${escapeHTML(
                                    transaction.paymentMethod ||
                                    "Other"
                                )}

                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="category-pill">

                        ${escapeHTML(
                            transaction.category ||
                            "Other"
                        )}

                    </span>

                </td>


                <td>

                    <span class="transaction-date">

                        ${formatDate(
                            transaction.date
                        )}

                    </span>

                </td>


                <td>

                    <span class="
                        transaction-type-pill
                        ${type}
                    ">

                        ${type === "income"
                            ? "Income"
                            : "Expense"
                        }

                    </span>

                </td>


                <td>

                    <span class="
                        transaction-amount
                        ${type}
                    ">

                        ${sign}${formatCurrency(
                            amount
                        )}

                    </span>

                </td>


                <td>

                    <div class="transaction-actions">


                        <button
                            type="button"
                            class="
                                transaction-action-btn
                                edit
                            "
                            data-id="${escapeHTML(
                                transaction.id
                            )}"
                            title="Edit"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="
                                transaction-action-btn
                                delete
                            "
                            data-id="${escapeHTML(
                                transaction.id
                            )}"
                            title="Delete"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>


                    </div>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    setupTableActions();

}


/* =========================================================
   TABLE ACTIONS
   ========================================================= */

function setupTableActions() {


    const editButtons =
        document.querySelectorAll(
            ".transaction-action-btn.edit"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".transaction-action-btn.delete"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    const transaction =
                        getTransactions()
                            .find(
                                function (item) {

                                    return String(
                                        item.id
                                    ) === String(
                                        id
                                    );

                                }
                            );


                    if (
                        transaction
                    ) {

                        openTransactionModal(
                            transaction
                        );

                    }

                }
            );

        }
    );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        this.dataset.id;


                    deleteTransaction(
                        id
                    );

                }
            );

        }
    );

}


/* =========================================================
   DELETE
   ========================================================= */

function deleteTransaction(
    id
) {


    const transactions =
        getTransactions();


    const transaction =
        transactions.find(
            function (item) {

                return String(
                    item.id
                ) === String(
                    id
                );

            }
        );


    if (!transaction) {

        showToastMessage(
            "Error",
            "Transaction not found.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Delete "${transaction.name}"?`
        );


    if (!confirmed) {

        return;

    }


    const updated =
        transactions.filter(
            function (item) {

                return String(
                    item.id
                ) !== String(
                    id
                );

            }
        );


    const saved =
        saveTransactions(
            updated
        );


    if (!saved) {

        showToastMessage(
            "Error",
            "Unable to delete transaction.",
            "error"
        );

        return;

    }


    renderTransactionsPage();


    showToastMessage(
        "Transaction Deleted",
        "Transaction deleted successfully.",
        "success"
    );

}


/* =========================================================
   EDIT FORM
   ========================================================= */

function fillTransactionForm(
    transaction
) {


    setInputValue(
        "transactionName",
        transaction.name
    );


    setInputValue(
        "transactionAmount",
        transaction.amount
    );


    setInputValue(
        "transactionCategory",
        transaction.category
    );


    setInputValue(
        "transactionDate",
        transaction.date
    );


    setInputValue(
        "paymentMethod",
        transaction.paymentMethod ||
        "UPI"
    );


    setInputValue(
        "transactionNotes",
        transaction.notes ||
        ""
    );


    setTransactionType(
        transaction.type ||
        "expense"
    );

}


/* =========================================================
   TYPE
   ========================================================= */

function setTransactionType(
    type
) {


    const radio =
        document.querySelector(
            `input[name="transactionType"][value="${type}"]`
        );


    if (radio) {

        radio.checked =
            true;

    }


    updateTypeSelector();

}


/* =========================================================
   TYPE SELECTOR UI
   ========================================================= */

function updateTypeSelector() {


    const options =
        document.querySelectorAll(
            ".type-option"
        );


    options.forEach(
        function (option) {

            const input =
                option.querySelector(
                    "input"
                );


            if (
                input &&
                input.checked
            ) {

                option.classList.add(
                    "active"
                );

            } else {

                option.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   SUBMIT BUTTON
   ========================================================= */

function updateSubmitButton(
    editMode
) {


    const button =
        document.getElementById(
            "transactionSubmitBtn"
        );


    if (!button) {

        return;

    }


    const icon =
        button.querySelector(
            "i"
        );


    const text =
        button.querySelector(
            "span"
        );


    if (editMode) {

        if (icon) {

            icon.className =
                "fa-solid fa-floppy-disk";

        }


        if (text) {

            text.textContent =
                "Update Transaction";

        }

    } else {

        if (icon) {

            icon.className =
                "fa-solid fa-plus";

        }


        if (text) {

            text.textContent =
                "Add Transaction";

        }

    }

}


/* =========================================================
   DATE
   ========================================================= */

function setTodayDate() {


    const input =
        document.getElementById(
            "transactionDate"
        );


    if (!input) {

        return;

    }


    if (
        !input.value
    ) {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        input.value =
            `${year}-${month}-${day}`;

    }

}


/* =========================================================
   DATE VALUE
   ========================================================= */

function getDateValue(
    date
) {


    if (!date) {

        return 0;

    }


    const value =
        new Date(
            date
        ).getTime();


    return Number.isNaN(
        value
    )
        ? 0
        : value;

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    date
) {


    if (!date) {

        return "—";

    }


    const parsed =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return escapeHTML(
            String(date)
        );

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(
    amount
) {


    amount =
        Number(amount) || 0;


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        amount
    );

}


/* =========================================================
   CATEGORY ICON
   ========================================================= */

function getCategoryIcon(
    category
) {


    const icons = {

        Food:
            '<i class="fa-solid fa-utensils"></i>',

        Transport:
            '<i class="fa-solid fa-car"></i>',

        Shopping:
            '<i class="fa-solid fa-bag-shopping"></i>',

        Bills:
            '<i class="fa-solid fa-file-invoice-dollar"></i>',

        Entertainment:
            '<i class="fa-solid fa-gamepad"></i>',

        Education:
            '<i class="fa-solid fa-graduation-cap"></i>',

        Health:
            '<i class="fa-solid fa-heart-pulse"></i>',

        Salary:
            '<i class="fa-solid fa-money-bill-wave"></i>',

        Investment:
            '<i class="fa-solid fa-chart-line"></i>',

        Freelance:
            '<i class="fa-solid fa-laptop-code"></i>',

        Other:
            '<i class="fa-solid fa-receipt"></i>'

    };


    return (
        icons[category] ||
        icons.Other
    );

}


/* =========================================================
   RESULT COUNT
   ========================================================= */

function updateResultCount(
    visible,
    total
) {


    const element =
        document.getElementById(
            "transactionResultCount"
        );


    if (!element) {

        return;

    }


    if (
        visible === total
    ) {

        element.textContent =
            `${total} transaction${
                total === 1
                    ? ""
                    : "s"
            }`;

    } else {

        element.textContent =
            `${visible} of ${total} transactions`;

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
   SET INPUT VALUE
   ========================================================= */

function setInputValue(
    id,
    value
) {


    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

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
   TOAST
   ========================================================= */

function showToastMessage(
    title,
    message,
    type = "success"
) {


    /*
     * Try existing FinTrack toast
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
     * Fallback custom toast
     */

    const toast =
        document.getElementById(
            "toast"
        );


    const toastTitle =
        document.getElementById(
            "toastTitle"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        toast &&
        toastTitle &&
        toastMessage
    ) {

        toastTitle.textContent =
            title;


        toastMessage.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }

}


/* =========================================================
   STORAGE SYNC
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            TRANSACTION_STORAGE_KEY
        ) {

            renderTransactionsPage();

        }

    }
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.FinTrackTransactions = {

    refresh:
        renderTransactionsPage,

    getAll:
        getTransactions,

    delete:
        deleteTransaction,

    edit:
        function (id) {

            const transaction =
                getTransactions()
                    .find(
                        function (item) {

                            return String(
                                item.id
                            ) === String(
                                id
                            );

                        }
                    );


            if (transaction) {

                openTransactionModal(
                    transaction
                );

            }

        }

};


/* =========================================================
   END
   ========================================================= */