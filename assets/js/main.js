(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var buttons = document.querySelectorAll("[data-filter]");
    var cards = document.querySelectorAll("[data-service]");
    var search = document.querySelector("[data-search]");
    var empty = document.querySelector("[data-empty]");
    var current = "all";

    function apply() {
        if (!cards.length) return;
        var q = search ? search.value.trim().toLowerCase() : "";
        var shown = 0;
        cards.forEach(function (card) {
            var group = card.getAttribute("data-group");
            var name = card.getAttribute("data-service");
            var okGroup = current === "all" || group === current;
            var okText = !q || name.indexOf(q) !== -1;
            var visible = okGroup && okText;
            card.hidden = !visible;
            if (visible) shown += 1;
        });
        if (empty) empty.hidden = shown !== 0;
    }

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            current = button.getAttribute("data-filter");
            buttons.forEach(function (item) { item.classList.remove("is-on"); });
            button.classList.add("is-on");
            apply();
        });
    });
    if (search) search.addEventListener("input", apply);

    var box = document.querySelector("[data-lightbox]");
    if (box) {
        var shot = box.querySelector("img");
        var links = Array.prototype.slice.call(document.querySelectorAll("[data-full]"));
        var index = 0;
        var touchX = null;

        function show(i) {
            if (!links.length) return;
            index = (i + links.length) % links.length;
            var link = links[index];
            shot.src = link.getAttribute("href");
            shot.alt = link.getAttribute("data-full") || "";
            box.classList.add("is-open");
        }

        function close() {
            box.classList.remove("is-open");
            shot.src = "";
        }

        links.forEach(function (link, i) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                show(i);
            });
        });

        box.addEventListener("click", function (event) {
            if (event.target === box || event.target.closest("[data-lightbox-close]")) close();
        });
        var prevBtn = box.querySelector("[data-lightbox-prev]");
        var nextBtn = box.querySelector("[data-lightbox-next]");
        if (prevBtn) prevBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            show(index - 1);
        });
        if (nextBtn) nextBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            show(index + 1);
        });

        document.addEventListener("keydown", function (event) {
            if (!box.classList.contains("is-open")) return;
            if (event.key === "Escape") close();
            if (event.key === "ArrowLeft") show(index - 1);
            if (event.key === "ArrowRight") show(index + 1);
        });

        box.addEventListener("touchstart", function (event) {
            if (!event.changedTouches || !event.changedTouches.length) return;
            touchX = event.changedTouches[0].clientX;
        }, { passive: true });
        box.addEventListener("touchend", function (event) {
            if (touchX === null || !event.changedTouches || !event.changedTouches.length) return;
            var dx = event.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) < 40) return;
            if (dx > 0) show(index - 1);
            else show(index + 1);
        }, { passive: true });
    }

    var bot = document.querySelector("[data-bot]");
    if (!bot) return;
    var panel = bot.querySelector(".bot-panel");
    var log = bot.querySelector("[data-bot-log]");
    var form = bot.querySelector("[data-bot-form]");
    var input = form.querySelector("input");
    var openBtn = bot.querySelector("[data-bot-open]");
    var faqs = [
        { keys: ["hello", "hi", "hey", "help", "start"], text: "Hello. I can help with Easy Clamp: the holder range, patent 434477, phone numbers, the Pimpri address, and the Shakur Grinding Service repairs listed on the services page." },
        { keys: ["address", "where", "location", "office", "visit", "map", "pimpri", "pune", "bhosale", "nehru"], text: "The workshop is Office No. 17, Bhosale Arcade, Sr. No. 103, Near Nehru Nagar Signal, Nehru Nagar, Pimpri-Chinchwad, Maharashtra 411018.", links: [{ href: "contact.html", label: "Open the contact page" }] },
        { keys: ["phone", "number", "call", "mobile", "contact"], text: "Call 9823444923 or 8087584443. You can also use the green WhatsApp button." },
        { keys: ["whatsapp", "wa"], text: "WhatsApp the workshop on 9823444923. The green button at the bottom left opens the chat." },
        { keys: ["email", "mail", "gmail"], text: "Email work.easyclamping@gmail.com or shakurgrindingservices@gmail.com." },
        { keys: ["instagram", "insta"], text: "Follow Easy Clamp on Instagram at @easy.clamp.", links: [{ href: "https://www.instagram.com/easy.clamp/", label: "Open Instagram" }] },
        { keys: ["facebook", "fb"], text: "See Easy Clamp on Facebook.", links: [{ href: "https://www.facebook.com/share/1HimnYBpW8/", label: "Open Facebook" }] },
        { keys: ["youtube", "yt", "video", "social", "follow"], text: "Watch Easy Clamp on YouTube at @easyclamp.", links: [{ href: "https://youtube.com/@easyclamp", label: "Open YouTube" }, { href: "https://www.facebook.com/share/1HimnYBpW8/", label: "Open Facebook" }] },
        { keys: ["easy clamp", "easyclamp", "product", "holder", "tool holder", "catalogue", "catalog", "bt", "hsk", "collet"], text: "Easy Clamp is the patented main product: a single unit tool holder for die mould and 5-axis finishing application. It is made in BT 30, BT 40, BT 50 and HSK-A50, A63 and A100, with through coolant and reduction collets.", links: [{ href: "easy-clamp.html", label: "See Easy Clamp" }] },
        { keys: ["patent", "patented", "434477", "licence", "license", "pct", "wo2024"], text: "India and international patent: Indian Patent No. 434477 was granted on 13 June 2023. The international filing is PCT/IN2023/050859, published as WO2024/057337A1.", links: [{ href: "patent.html", label: "View the patent" }] },
        { keys: ["service", "repair", "recondition", "tooling", "which tool", "what do you", "list", "vice", "chuck", "cylinder", "hydrogrip", "mandrel", "spindle", "boring", "hydraulic", "rest", "router", "tapping", "sidelock", "shrink", "antivibration", "revolving", "live tool"], text: "We offer tool holder reconditioning: boring heads, hydro grip holders, mandrels, vices, rests, and other precision tooling.", links: [{ href: "services.html", label: "Browse all services" }] },
        { keys: ["warranty", "inspect", "inspection", "turnaround", "fast"], text: "Each repair starts with inspection. The posters list inspection and repair, a fast repair service, and service with warranty." },
        { keys: ["who are", "company", "sartaj", "about the", "about you", "legacy", "generation", "1987", "family"], text: "Shakur Grinding Services is a family-run precision tooling business since 1987, now in its third generation. Sartaj Enterprises manufactures Easy Clamp, Patent No. 434477.", links: [{ href: "about.html", label: "About us" }] },
        { keys: ["enquiry", "inquire", "quote", "send a job", "book"], text: "Use the contact form and tell us the tool type, make, and the fault. Or call 9823444923.", links: [{ href: "contact.html", label: "Send an enquiry" }] }
    ];

    function addMsg(kind, text, links) {
        var node = document.createElement("div");
        node.className = "bot-msg " + kind;
        var p = document.createElement("p");
        p.textContent = text;
        node.appendChild(p);
        (links || []).forEach(function (link) {
            var a = document.createElement("a");
            a.href = link.href;
            a.textContent = link.label;
            node.appendChild(document.createElement("br"));
            node.appendChild(a);
        });
        log.appendChild(node);
        log.scrollTop = log.scrollHeight;
    }

    function reply(question) {
        var q = question.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
        var best = null;
        var bestScore = 0;
        faqs.forEach(function (item) {
            var score = 0;
            item.keys.forEach(function (key) {
                if (q.indexOf(key) !== -1) score += key.length;
            });
            if (score > bestScore) {
                best = item;
                bestScore = score;
            }
        });
        if (!best) {
            addMsg("bot", "I only answer questions about this website: the workshop, phone numbers, Easy Clamp, patent 434477, and the repair services. Try one of the buttons above.");
            return;
        }
        addMsg("bot", best.text, best.links);
    }

    function ask(question) {
        var text = question.trim();
        if (!text) return;
        addMsg("user", text);
        reply(text);
    }

    function setOpen(open) {
        panel.classList.toggle("is-open", open);
        openBtn.setAttribute("aria-expanded", open ? "true" : "false");
        if (open && !log.childElementCount) {
            addMsg("bot", "Hello. Ask me about Easy Clamp, the patent, a phone number, or a repair.");
        }
        if (open) input.focus();
    }

    openBtn.addEventListener("click", function () { setOpen(!panel.classList.contains("is-open")); });
    bot.querySelector("[data-bot-close]").addEventListener("click", function () { setOpen(false); });
    bot.querySelectorAll("[data-ask]").forEach(function (button) {
        button.addEventListener("click", function () { setOpen(true); ask(button.getAttribute("data-ask")); });
    });
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        ask(input.value);
        input.value = "";
    });

    document.querySelectorAll("[data-viewer]").forEach(function (viewer) {
        var img = viewer.querySelector("[data-view-img]");
        var range = viewer.querySelector("[data-range-grid]");
        var root = viewer.closest(".product-stage") || document;
        root.querySelectorAll("[data-view]").forEach(function (button) {
            button.addEventListener("click", function () {
                var view = button.getAttribute("data-view");
                root.querySelectorAll("[data-view]").forEach(function (item) { item.classList.remove("is-on"); });
                button.classList.add("is-on");
                if (view === "range") {
                    if (range) range.classList.add("is-on");
                    if (img) img.hidden = true;
                    return;
                }
                if (range) range.classList.remove("is-on");
                if (img) {
                    img.hidden = false;
                    img.src = view;
                }
            });
        });
    });
})();
