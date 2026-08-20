/*
 * Projects index gallery.
 *
 * Tiles are laid out in justified rows: every row is scaled so its photos share
 * one height and together fill the exact width of the gallery. Because each
 * tile's width comes from its own aspect ratio, no project photo is ever
 * cropped. The first visible project is promoted to a full-width lead tile, and
 * a row left holding a single project becomes a full-width tile too, so the
 * gallery reads as a finished block under every filter.
 */
(function () {
    "use strict";

    var grid = document.querySelector("[data-projects-grid]");

    if (!grid) {
        return;
    }

    var tiles = Array.prototype.slice.call(grid.querySelectorAll(".project-tile"));
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-project-filter]"));
    var countLabel = document.querySelector("[data-projects-count]");
    var emptyNote = document.querySelector("[data-projects-empty]");

    var TARGET_ROW_HEIGHT = 300;
    var TARGET_ROW_HEIGHT_MD = 232;
    var MAX_ROW_HEIGHT = 430;
    var STACK_BREAKPOINT = 768;
    var MAX_UPSCALE = 1.3;

    function ratioOf(tile) {
        var declared = parseFloat(tile.getAttribute("data-ratio"));
        return declared > 0 ? declared : 1.5;
    }

    function visibleTiles() {
        return tiles.filter(function (tile) {
            return !tile.hidden;
        });
    }

    /* A wide tile spans the gallery. If the photo is large enough to fill that
       width without being blown up, it runs edge to edge; if it is not, it sits
       whole inside a shorter band with a blurred copy of itself behind it. */
    function setWide(tile, wide, width) {
        tile.classList.toggle("is-wide", wide);
        tile.style.width = "";
        tile.style.height = "";

        if (!wide) {
            tile.classList.remove("is-full");
            return;
        }

        var image = tile.querySelector("img");
        var fullHeight = width / ratioOf(tile);
        var natural = image ? image.naturalHeight : 0;
        var fits = natural > 0 && fullHeight <= natural * MAX_UPSCALE;

        tile.classList.toggle("is-full", fits);

        if (fits) {
            tile.style.height = Math.round(fullHeight) + "px";
            return;
        }

        var fill = tile.querySelector(".media-fill");

        if (!fill && image) {
            fill = document.createElement("span");
            fill.className = "media-fill";
            fill.setAttribute("aria-hidden", "true");
            fill.style.backgroundImage = "url(" + image.getAttribute("src") + ")";
            tile.insertBefore(fill, tile.firstChild);
        }
    }

    function applyRow(row, height, gap, width) {
        var used = gap * (row.length - 1);

        row.forEach(function (tile, index) {
            var tileWidth = Math.floor(ratioOf(tile) * height);

            if (index === row.length - 1) {
                // The last tile absorbs rounding so the row lands flush.
                tileWidth = Math.max(1, width - used);
            } else {
                used += tileWidth;
            }

            tile.style.width = tileWidth + "px";
            tile.style.height = Math.round(height) + "px";
        });
    }

    function layout() {
        var items = visibleTiles();

        if (!items.length) {
            return;
        }

        var styles = window.getComputedStyle(grid);
        var gap = parseFloat(styles.columnGap) || 14;
        var width = grid.clientWidth;

        if (window.innerWidth < STACK_BREAKPOINT) {
            items.forEach(function (tile) {
                setWide(tile, false, width);
            });
            return;
        }

        var target = width < 1100 ? TARGET_ROW_HEIGHT_MD : TARGET_ROW_HEIGHT;

        items.forEach(function (tile) {
            setWide(tile, false, width);
        });

        // The opening project always reads as the lead.
        var lead = items.shift();
        setWide(lead, true, width);

        var row = [];
        var sum = 0;

        items.forEach(function (tile) {
            var previousHeight = row.length ? (width - gap * (row.length - 1)) / sum : 0;

            row.push(tile);
            sum += ratioOf(tile);

            var height = (width - gap * (row.length - 1)) / sum;

            if (height > target) {
                return;
            }

            // The row is now shorter than the target. Keep this tile only if
            // that lands closer to the target than closing the row without it,
            // otherwise short rows of many small tiles pile up.
            if (row.length > 1 && previousHeight - target < target - height) {
                var carried = row.pop();
                sum -= ratioOf(carried);
                applyRow(row, previousHeight, gap, width);
                row = [carried];
                sum = ratioOf(carried);
                return;
            }

            applyRow(row, height, gap, width);
            row = [];
            sum = 0;
        });

        if (!row.length) {
            return;
        }

        var lastHeight = (width - gap * (row.length - 1)) / sum;

        if (row.length === 1 || lastHeight > MAX_ROW_HEIGHT) {
            // One project left over, or a row that would tower over the rest:
            // close the gallery with a full-width tile instead of a gap.
            row.forEach(function (tile) {
                setWide(tile, true, width);
            });
            return;
        }

        applyRow(row, lastHeight, gap, width);
    }

    var layoutTimer = null;

    function queueLayout(delay) {
        window.clearTimeout(layoutTimer);
        layoutTimer = window.setTimeout(layout, delay || 60);
    }

    function updateCount(total) {
        if (countLabel) {
            countLabel.textContent = total === 1 ? "1 project" : total + " projects";
        }

        if (emptyNote) {
            emptyNote.hidden = total !== 0;
        }
    }

    function applyFilter(filter) {
        var target = filters.filter(function (button) {
            return button.getAttribute("data-project-filter") === filter;
        })[0];

        if (!target) {
            return;
        }

        filters.forEach(function (button) {
            var selected = button === target;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-pressed", selected ? "true" : "false");
        });

        tiles.forEach(function (tile) {
            tile.hidden = filter !== "all" && tile.getAttribute("data-project-status") !== filter;
        });

        updateCount(visibleTiles().length);
        layout();
    }

    /* Viewer ------------------------------------------------------------- */

    var viewer = document.querySelector("[data-project-viewer]");
    var viewerImage = viewer && viewer.querySelector("[data-viewer-image]");
    var viewerTitle = viewer && viewer.querySelector("[data-viewer-title]");
    var viewerMeta = viewer && viewer.querySelector("[data-viewer-meta]");
    var viewerPosition = viewer && viewer.querySelector("[data-viewer-position]");
    var viewerClose = viewer && viewer.querySelector(".project-viewer-close");
    var viewerPrev = viewer && viewer.querySelector(".project-viewer-prev");
    var viewerNext = viewer && viewer.querySelector(".project-viewer-next");
    var viewerItems = [];
    var viewerIndex = 0;
    var lastFocused = null;

    function showViewerItem(index) {
        if (!viewerItems.length) {
            return;
        }

        viewerIndex = (index + viewerItems.length) % viewerItems.length;

        var tile = viewerItems[viewerIndex];
        var image = tile.querySelector("img");
        var title = tile.querySelector(".project-tile-caption h2");
        var meta = tile.querySelector(".project-tile-caption p");
        var status = tile.getAttribute("data-project-status") === "ongoing" ? "Ongoing" : "Completed";

        viewer.classList.add("is-swapping");
        window.setTimeout(function () {
            viewer.classList.remove("is-swapping");
        }, 180);

        viewerImage.src = image.getAttribute("src");
        viewerImage.alt = image.getAttribute("alt") || "";
        viewerTitle.textContent = title ? title.textContent : "";
        viewerMeta.textContent = status + (meta && meta.textContent ? " · " + meta.textContent : "");
        viewerPosition.textContent = (viewerIndex + 1) + " / " + viewerItems.length;

        var single = viewerItems.length < 2;
        viewerPrev.hidden = single;
        viewerNext.hidden = single;
    }

    function openViewer(tile) {
        if (!viewer) {
            return;
        }

        viewerItems = visibleTiles();
        lastFocused = document.activeElement;

        showViewerItem(viewerItems.indexOf(tile));
        viewer.classList.add("is-open");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add("viewer-open");
        viewerClose.focus();
    }

    function closeViewer() {
        if (!viewer || !viewer.classList.contains("is-open")) {
            return;
        }

        viewer.classList.remove("is-open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("viewer-open");

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
    }

    if (viewer) {
        viewerClose.addEventListener("click", closeViewer);
        viewerPrev.addEventListener("click", function () {
            showViewerItem(viewerIndex - 1);
        });
        viewerNext.addEventListener("click", function () {
            showViewerItem(viewerIndex + 1);
        });

        viewer.addEventListener("click", function (event) {
            if (event.target === viewer || event.target.classList.contains("project-viewer-figure")) {
                closeViewer();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (!viewer.classList.contains("is-open")) {
                return;
            }

            if (event.key === "Escape") {
                closeViewer();
            } else if (event.key === "ArrowLeft") {
                showViewerItem(viewerIndex - 1);
            } else if (event.key === "ArrowRight") {
                showViewerItem(viewerIndex + 1);
            } else if (event.key === "Tab") {
                // Keep focus inside the dialog while it is open.
                var focusable = Array.prototype.slice
                    .call(viewer.querySelectorAll("button"))
                    .filter(function (button) {
                        return !button.hidden;
                    });
                var first = focusable[0];
                var last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
    }

    /* Wiring ------------------------------------------------------------- */

    tiles.forEach(function (tile) {
        tile.addEventListener("click", function () {
            openViewer(tile);
        });

        tile.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openViewer(tile);
            }
        });

        var image = tile.querySelector("img");

        // Trust the real file over the declared ratio once the photo arrives,
        // so swapping an image out never reintroduces cropping.
        if (image) {
            image.addEventListener("load", function () {
                if (image.naturalWidth && image.naturalHeight) {
                    var actual = image.naturalWidth / image.naturalHeight;

                    if (Math.abs(actual - ratioOf(tile)) > 0.02) {
                        tile.setAttribute("data-ratio", actual.toFixed(4));
                        tile.style.setProperty("--ratio", actual.toFixed(4));
                    }
                }

                // Natural dimensions decide whether a wide tile can run full
                // bleed, so the gallery settles again once photos arrive.
                queueLayout();
            });
        }
    });

    filters.forEach(function (button) {
        var status = button.getAttribute("data-project-filter");
        var counter = button.querySelector("small");

        if (counter) {
            counter.textContent = status === "all"
                ? String(tiles.length).padStart(2, "0")
                : String(tiles.filter(function (tile) {
                    return tile.getAttribute("data-project-status") === status;
                }).length).padStart(2, "0");
        }

        button.addEventListener("click", function () {
            applyFilter(status);

            if (window.location.hash.slice(1) !== status) {
                window.history.replaceState(null, "", status === "all" ? window.location.pathname : "#" + status);
            }
        });
    });

    window.addEventListener("resize", function () {
        queueLayout(120);
    });

    window.addEventListener("hashchange", function () {
        applyFilter(window.location.hash.slice(1) || "all");
    });

    tiles.forEach(function (tile) {
        tile.style.setProperty("--ratio", ratioOf(tile).toFixed(4));
    });

    applyFilter(window.location.hash.slice(1) || "all");
}());
