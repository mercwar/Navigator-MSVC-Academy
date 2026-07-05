/* 
AVIS BLOCK
FILE: script.js
PURPOSE: MercWar Standard C & WinAPI Tutorial - Fancy Sidebar Logic + Indicators
AUTHOR: Demon
NOTES: Dropdown animation, arrow indicators, chapter loading, letter-safe loader
*/
// Global states to track position and lock configuration
let isScrollPinned = false;
let pinnedScrollPosition = 0;

function toggleScrollPin() {
  const icon = document.getElementById("scrollPinIcon");
  const text = document.getElementById("scrollPinText");
  const btn = document.getElementById("scrollPinBtn");

  isScrollPinned = !isScrollPinned;

  if (isScrollPinned) {
    // 🔥 Capture immediately
    pinnedScrollPosition = window.scrollY;

    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Update UI
    icon.textContent = "🔒";
    text.textContent = "Pinned";
    btn.style.borderColor = "#ff6a00";
  } else {
    // Unlock body scroll
    document.body.style.overflow = "auto";

    // Update UI
    icon.textContent = "🔓";
    text.textContent = "Unpinned";
    btn.style.borderColor = "#ffe066";
  }
}
function handleFrameLoadScroll() {
  if (isScrollPinned) {
  

    // Delay the scroll restore so the DOM has time to render
    setTimeout(() => {
      window.scrollTo({ top: pinnedScrollPosition, behavior: "instant" });
    
    }, 150); // 150ms delay, adjust as needed
  }
}





/* DROPDOWN TOGGLER WITH INDICATORS */
function toggleDropdown(id) {
  const content = document.getElementById(id);
  if (!content) return;

  const header = document.querySelector('[data-dropdown="' + id + '"]');
  const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";

  if (isOpen) {
    content.style.maxHeight = "0px";
    if (header) header.classList.remove("active");
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    if (header) header.classList.add("active");
  }
}

/* OPTIONAL: AUTO-COLLAPSE OTHER DROPDOWNS */
function collapseOthers(exceptId) {
  const contents = document.querySelectorAll(".dropdown-content");
  contents.forEach(el => {
    if (el.id !== exceptId) {
      el.style.maxHeight = "0px";
      const header = document.querySelector('[data-dropdown="' + el.id + '"]');
      if (header) header.classList.remove("active");
    }
  });
}
/* CHAPTER LOADER — FIXED TO HANDLE LETTERS SAFELY */
function loadChapter(id) {
  let file;

  if (typeof id === "undefined") {
    document.getElementById("content").innerHTML =
      "<p>Invalid chapter call: ID is undefined.</p>";
    return;
  }

  if (typeof id === "number") {
    // Numeric → chapter01.html, chapter02.html
    file = "html/chapter" + String(id).padStart(2, "0") + ".html";
  } else {
    const str = id;

    if (/^_[a-z]$/.test(str)) {
      // Underscore + letter → chapter_A.html
      const letter = str.substring(1); // drop underscore
      file = "html/chapter_" + letter + ".html";
    } else if (/^[A-Z]$/.test(str)) {
      // Single letter → chapterA.html
      file = "html/chapter" + str + ".html";
    } else {
      // Fallback → treat as raw string
      file = "html/chapter" + str + ".html";
    }
  }

  fetch(file)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(html => {
      const content = document.getElementById("content");
      if (!content) return;
      content.innerHTML = html;

      // Fire the listener
      document.dispatchEvent(new Event("chapterLoaded"));

      // 🔥 Auto scroll the content cell back to top
      const contentCell = document.getElementById("content");
      if (contentCell) {
        contentCell.scrollTop = 0;
		handleFrameLoadScroll();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .catch(err => {
      const content = document.getElementById("content");
      if (!content) return;
      content.innerHTML =
        "<p>Error loading chapter " + id + ": " + err + "</p>";
    });
}


/* INITIALIZATION: ATTACH LISTENERS */
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".dropdown-header");
  headers.forEach(header => {
    const id = header.getAttribute("data-dropdown");
    if (!id) return;

    header.addEventListener("click", () => {
      collapseOthers(id);
      toggleDropdown(id);
    });
  });
});
document.addEventListener("chapterLoaded", () => {
  const tables = document.querySelectorAll("#content table");

  tables.forEach(table => {
   // SAFE HEADER REMOVAL
const headerRow = table.querySelector("tr:first-child");

if (headerRow) {
  const ths = headerRow.querySelectorAll("th");

  // Only remove if EXACTLY 2 TH cells AND they match
  if (ths.length === 2) {
    const h0 = ths[0].innerText.trim().toLowerCase();
    const h1 = ths[1].innerText.trim().toLowerCase();

    if (h0 === "topic" && h1 === "description") {
      headerRow.remove();
    }
  }
}


    // Now process the remaining rows
    const rows = table.querySelectorAll("tr");

    rows.forEach(row => {
      const tds = row.querySelectorAll("td");

      if (tds.length === 2) {
        const topicCell = tds[0];
        const descCell = tds[1];

        let topicText = topicCell.innerHTML.trim();
        let descText = descCell.innerHTML.trim();
        const itemData = topicCell.dataset.item || "";

        // Strip headers from cell text
        topicText = topicText
          .replace(/^Topic:\s*/i, "")
          .replace(/^Stage:\s*/i, "")
          .trim();

        descText = descText
          .replace(/^Description:\s*/i, "")
          .trim();

        // Build stacked format
        topicCell.innerHTML = `
          <div class="item-topic">${topicText}</div>
          <div class="item-desc">${descText}</div>
          <div class="item-data">${itemData}</div>
        `;

        descCell.remove();
        topicCell.setAttribute("colspan", "2");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Toggle category active state

  // Highlight selected item
  document.querySelectorAll("#sidebar button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sidebar button.active")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

});
