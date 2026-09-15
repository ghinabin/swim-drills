/* Route context and per-history-entry view restoration. */
(() => {
  "use strict";
  const rootPages = {
    "index.html": "Overview",
    "plan.html": "Training plan",
    "drills.html": "Drill library",
    "progress.html": "Progress",
  };
  const file = location.pathname.split("/").pop() || "index.html";
  const params = new URLSearchParams(location.search);
  const storage = {
    get(key) {
      try {
        return JSON.parse(sessionStorage.getItem("lane:nav:" + key) || "null");
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        sessionStorage.setItem("lane:nav:" + key, JSON.stringify(value));
      } catch (_) {}
    },
    remove(key) {
      try {
        sessionStorage.removeItem("lane:nav:" + key);
      } catch (_) {}
    },
  };
  const newID = () =>
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  const entry = history.state?.laneEntry || newID();
  const relativeURL = () => file + location.search + location.hash;
  const handoff = storage.get("handoff");
  storage.remove("handoff");
  const incoming =
    handoff && handoff.url === relativeURL() && Date.now() - handoff.at < 15000
      ? handoff.parent
      : null;
  let parent = history.state?.laneParent || incoming;
  if (!parent && file === "session.html") {
    const originFile = params.get("from") + ".html";
    const saved = storage.get("view:" + params.get("view"));
    const valid = Object.hasOwn(rootPages, originFile);
    parent = {
      url: valid ? originFile : "plan.html",
      label: valid ? rootPages[originFile] : "Training plan",
      view:
        valid && saved?.url?.split(/[?#]/)[0] === originFile
          ? params.get("view")
          : null,
      canBack: false,
    };
    if (valid && saved?.url?.split(/[?#]/)[0] === originFile)
      parent.url = saved.url;
  }
  history.replaceState(
    { ...history.state, laneEntry: entry, laneParent: parent },
    "",
  );
  history.scrollRestoration = "manual";
  let ready = false;
  let restoring = false;
  let savedY = 0;
  const motion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
  function capture() {
    if (!ready || restoring || document.querySelector("dialog[open]")) return;
    const active = document.activeElement;
    const allLinks = Array.from(document.querySelectorAll("a[href]"));
    const snapshot = {
      url: relativeURL(),
      y: scrollY,
      details: Array.from(document.querySelectorAll("details[id]")).map(
        (el) => [el.id, el.open],
      ),
      focus: active?.tagName === "A" ? allLinks.indexOf(active) : null,
      query: document.getElementById("drill-search")?.value,
      filter: document.getElementById("drill-filter")?.value,
    };
    storage.set("view:" + entry, snapshot);
  }
  function restore(snapshot, focus = true) {
    if (!snapshot) return false;
    restoring = true;
    (snapshot.details || []).forEach(([id, open]) => {
      const el = document.getElementById(id);
      if (el?.tagName === "DETAILS") el.open = open;
    });
    if (focus && Number.isInteger(snapshot.focus))
      document
        .querySelectorAll("a[href]")
        [snapshot.focus]?.focus({ preventScroll: true });
    scrollTo({ top: snapshot.y || 0, behavior: "instant" });
    requestAnimationFrame(() => {
      scrollTo({ top: snapshot.y || 0, behavior: "instant" });
      restoring = false;
    });
    return true;
  }
  function jump(target, focus = true) {
    if (!target) return;
    const details = target.closest("details");
    if (details) details.open = true;
    if (target.tagName === "DETAILS") target.open = true;
    target.scrollIntoView({ block: "start", behavior: motion() });
    if (focus) {
      const el = target.matches("a,button,summary")
        ? target
        : target.querySelector("summary") || target;
      if (!el.matches("a,button,summary")) el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
  }
  function returnURL() {
    const url = new URL(parent?.url || "plan.html", location.href);
    if (parent?.view) url.searchParams.set("restore", parent.view);
    else if (file === "session.html" && url.pathname.endsWith("/plan.html"))
      url.hash = "day-" + (params.get("id") || "");
    return url.pathname.split("/").pop() + url.search + url.hash;
  }
  function back() {
    capture();
    if (parent?.canBack) history.back();
    else location.replace(returnURL());
  }
  function sessionURL(id) {
    const origin = parent || {
      url: relativeURL(),
      label: rootPages[file],
      view: entry,
    };
    const url = new URL("session.html", location.href);
    url.searchParams.set("id", id);
    if (origin?.label) {
      url.searchParams.set(
        "from",
        origin.url.split(/[?#]/)[0].replace(".html", ""),
      );
      if (origin.view) url.searchParams.set("view", origin.view);
    }
    return url.pathname.split("/").pop() + url.search;
  }
  function navigateSession(url) {
    capture();
    const context =
      file === "session.html"
        ? parent
        : {
            url: relativeURL(),
            label: rootPages[file],
            view: entry,
            canBack: true,
          };
    const target = new URL(url, location.href);
    const relative =
      target.pathname.split("/").pop() + target.search + target.hash;
    storage.set("handoff", { url: relative, parent: context, at: Date.now() });
    if (file === "session.html") location.replace(relative);
    else location.assign(relative);
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    if (link.hasAttribute("data-return")) {
      event.preventDefault();
      back();
      return;
    }
    if (link.hasAttribute("data-jump")) {
      event.preventDefault();
      const target = document.getElementById(link.hash.slice(1));
      jump(target);
      history.replaceState(history.state, "", link.hash);
      return;
    }
    const url = new URL(link.href);
    if (
      url.origin === location.origin &&
      url.pathname.endsWith("/session.html")
    ) {
      event.preventDefault();
      navigateSession(link.href);
      return;
    }
    capture();
  });
  window.addEventListener("pagehide", capture);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") capture();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    const snapshot = storage.get("view:" + entry);
    document.dispatchEvent(new Event("lane:resume"));
    requestAnimationFrame(() => restore(snapshot));
  });
  function restoreDialog() {
    const dialog = document.getElementById(history.state?.laneDialog);
    if (dialog?.tagName === "DIALOG" && !dialog.open) {
      const trigger = Array.from(
        document.querySelectorAll("[data-open-timer]"),
      ).find((el) => el.getClientRects().length);
      window.SwimNavigation.openDialog(dialog, trigger, false);
    }
  }
  window.addEventListener("popstate", restoreDialog);
  window.SwimNavigation = {
    sessionURL,
    navigateSession,
    back,
    jump,
    capture,
    restore,
    returnURL,
    returnLabel: () => parent?.label || "Training plan",
    snapshot: () => storage.get("view:" + entry),
    ready() {
      ready = true;
      requestAnimationFrame(() => {
        const requested = params.get("restore");
        const saved = storage.get("view:" + (requested || entry));
        if (saved && saved.url.split(/[?#]/)[0] === file) restore(saved);
        else if (location.hash)
          jump(
            document.getElementById(decodeURIComponent(location.hash.slice(1))),
          );
        if (requested) {
          const clean = new URL(location.href);
          clean.searchParams.delete("restore");
          history.replaceState(history.state, "", clean);
        }
        requestAnimationFrame(restoreDialog);
      });
    },
    openDialog(dialog, trigger, recordHistory = true) {
      if (dialog.open) return;
      capture();
      savedY = scrollY;
      if (recordHistory)
        history.pushState({ ...history.state, laneDialog: dialog.id }, "");
      dialog.showModal();
      document.body.classList.add("dialog-open");
      dialog.querySelector("[data-close-dialog]")?.focus();
      let closing = false;
      const close = () => {
        if (closing) return;
        closing = true;
        if (history.state?.laneDialog === dialog.id) history.back();
        else finish();
      };
      const finish = () => {
        window.removeEventListener("popstate", popped);
        dialog.removeEventListener("cancel", cancel);
        dialog.removeEventListener("click", clicked);
        dialog.removeEventListener("close", closed);
        dialog.removeEventListener("keydown", trapFocus);
        dialog.close();
        document.body.classList.remove("dialog-open");
        scrollTo({ top: savedY, behavior: "instant" });
        trigger?.focus({ preventScroll: true });
      };
      const popped = () => {
        if (history.state?.laneDialog !== dialog.id) finish();
      };
      const cancel = (event) => {
        event.preventDefault();
        close();
      };
      const closed = () => close();
      const clicked = (event) => {
        if (event.target.closest("[data-close-dialog]")) close();
        else if (event.target === dialog) {
          const r = dialog.getBoundingClientRect();
          if (
            event.clientY < r.top ||
            event.clientY > r.bottom ||
            event.clientX < r.left ||
            event.clientX > r.right
          )
            close();
        }
      };
      const trapFocus = (event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          dialog.querySelectorAll(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      };
      dialog.addEventListener("keydown", trapFocus);
      window.addEventListener("popstate", popped);
      dialog.addEventListener("cancel", cancel);
      dialog.addEventListener("click", clicked);
      dialog.addEventListener("close", closed);
    },
  };
})();
