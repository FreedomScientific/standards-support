/// <reference path="scripts/typings/jquery/jquery.d.ts" />
$(document).ready(function () {
    var button = $("#move-btn"), menu = $(".menu");
    function hideMenu() {
        menu.addClass("hidden");
        menu.attr("aria-hidden", "true");
        button.attr("aria-expanded", "false");
    }
    function showMenu() {
        menu.find(".selected").removeClass("selected");
        menu.removeClass("hidden");
        menu.attr("aria-hidden", "false");
        button.attr("aria-expanded", "true");
        var position = button.position();
        menu.css({
            top: (position.top + button.outerHeight()),
            left: position.left
        });
        //$(".menu li:first").focus();
    }
    function toggleMenu() {
        var expanded = button.attr("aria-expanded");
        if (expanded == "false") {
            showMenu();
            $(".menu li:first").focus();
        }
        else {
            hideMenu();
        }
    }
    button.on({
        keydown: function (e) {
            var keyCode = e.keyCode;
            if (keyCode === 13 || keyCode === 32) {
                toggleMenu();
                return;
            }
            if (keyCode == 40) {
                showMenu();
                $(".menu li:first").focus();
            }
        },
        mousedown: function (e) {
            e.preventDefault();
            toggleMenu();
        }
    });
    menu.on("mouseenter", "li", function () {
        menu.find(".selected").removeClass("selected");
        $(this).addClass("selected");
    });
    menu.on("mouseleave", "li", function () {
        menu.find(".selected").removeClass("selected");
    });
    menu.on("keydown", function (e) {
        var keyCode = e.keyCode, target = e.target, selected, selector, event;
        switch (keyCode) {
            case 27:
                hideMenu();
                button.focus();
                break;
            case 38:
            case 40:
                if (target === menu[0]) {
                    if ((selected = menu.find(".selected")) && selected[0]) {
                        event = $.Event("keydown", { keyCode: keyCode });
                        selected.trigger(event);
                    }
                    else {
                        if (keyCode === 38) {
                            selector = "li:last-child";
                        }
                        else if (keyCode === 40) {
                            selector = "li:first-child";
                        }
                        menu.find(selector).addClass("selected").focus();
                    }
                }
                break;
            default:
                $("li").each(function () {
                    if ($(this).text().substr(0, 1).toUpperCase() == String.fromCharCode(keyCode).toUpperCase()) {
                        $(this).addClass("selected").focus();
                    }
                });
        }
    });
    menu.on("click", "li", function (e) {
        alert("You clicked: " + $(e.target).text());
    });
    menu.on("keydown", "li", function (e) {
        var selected = menu.find(".selected"), li = selected[0] ? selected : $(e.target), next, nextItem;
        switch (e.keyCode) {
            case 35:
                next = "last";
                break;
            case 38:
                next = "prev";
                break;
            case 40:
                next = "next";
                break;
            case 13: // Enter
            case 32:
                selected.trigger($.Event("click"));
                selected.blur();
                break;
        }
        if (next && (nextItem = li[next]()) && nextItem[0]) {
            li.removeClass("selected");
            nextItem.addClass("selected").focus();
        }
    });
    menu.on("focusout", function (e) {
        setTimeout(function () {
            if (!$.contains(menu[0], document.activeElement)) {
                menu.addClass("hidden");
                menu.attr("aria-hidden", "true");
            }
        }, 0);
    });
});
//# sourceMappingURL=app.js.map