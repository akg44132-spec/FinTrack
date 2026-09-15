/* =========================================================
   FINTRACK - SIMPLE FRONTEND AUTHENTICATION
   ========================================================= */

(function () {
    "use strict";

    const LOGIN_KEY = "fintrack_logged_in";
    const USER_KEY = "fintrack_user";


    /* =========================================================
       GET CURRENT USER
       ========================================================= */

    function getUser() {
        try {
            const user = localStorage.getItem(USER_KEY);

            return user
                ? JSON.parse(user)
                : null;

        } catch (error) {

            console.error("Unable to read user:", error);

            return null;
        }
    }


    /* =========================================================
       CHECK LOGIN
       ========================================================= */

    function isLoggedIn() {

        return (
            localStorage.getItem(LOGIN_KEY) === "true"
        );

    }


    /* =========================================================
       PROTECT PRIVATE PAGES
       ========================================================= */

    function protectPage() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        // Login and register pages are public
        if (
            currentPage === "login.html" ||
            currentPage === "register.html"
        ) {
            return true;
        }


        // Every other page requires login
        if (!isLoggedIn()) {

            window.location.replace(
                "login.html"
            );

            return false;
        }


        return true;
    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    function logout() {

        localStorage.removeItem(
            LOGIN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );

        localStorage.removeItem(
            "fintrack_user_email"
        );

        window.location.replace(
            "login.html"
        );
    }


    /* =========================================================
       PROFILE DROPDOWN
       ========================================================= */

    function setupProfileDropdown() {

        const profileBtn =
            document.getElementById(
                "userProfileBtn"
            );

        const profileWrapper =
            document.querySelector(
                ".profile-wrapper"
            );

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (
            !profileBtn ||
            !profileWrapper
        ) {
            return;
        }


        /* Open / Close */

        profileBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                profileWrapper.classList.toggle(
                    "open"
                );

            }
        );


        /* Close outside */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !profileWrapper.contains(
                        event.target
                    )
                ) {

                    profileWrapper.classList.remove(
                        "open"
                    );

                }

            }
        );


        /* Logout */

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                function () {

                    logout();

                }
            );

        }

    }


    /* =========================================================
       UPDATE USER UI
       ========================================================= */

    function updateUserUI() {

        const user = getUser();

        if (!user) {
            return;
        }


        /* User name */

        document
            .querySelectorAll(
                "[data-user-name]"
            )
            .forEach(function (element) {

                element.textContent =
                    user.name ||
                    "User";

            });


        /* User email */

        document
            .querySelectorAll(
                "[data-user-email]"
            )
            .forEach(function (element) {

                element.textContent =
                    user.email ||
                    "";

            });


        /* Avatar */

        document
            .querySelectorAll(
                "[data-user-avatar]"
            )
            .forEach(function (element) {

                const name =
                    user.name ||
                    "User";

                element.textContent =
                    name
                        .charAt(0)
                        .toUpperCase();

            });

    }


    /* =========================================================
       APPLY SAVED THEME
       ========================================================= */

    function applySavedTheme() {

        try {

            const savedSettings =
                localStorage.getItem(
                    "fintrack_settings"
                );


            if (!savedSettings) {
                return;
            }


            const settings =
                JSON.parse(
                    savedSettings
                );


            if (
                settings.darkMode === false
            ) {

                document.body.classList.add(
                    "light-theme"
                );

            } else {

                document.body.classList.remove(
                    "light-theme"
                );

            }

        } catch (error) {

            console.error(
                "Unable to apply theme:",
                error
            );

        }

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */

    function initializeAuth() {

        protectPage();

        updateUserUI();

        setupProfileDropdown();

        applySavedTheme();

    }


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.FinTrackAuth = {

        getUser,
        isLoggedIn,
        protectPage,
        logout,
        updateUserUI,
        setupProfileDropdown,
        applySavedTheme

    };


    /* =========================================================
       RUN
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAuth
        );

    } else {

        initializeAuth();

    }

})();