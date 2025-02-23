document.addEventListener("DOMContentLoaded", () => {
  const priceToggle = document.getElementById("priceToggle");
  const passengerCount = document.getElementById("passengerCount");
  const cabinCards = document.querySelectorAll(".cabin-card");

  // Store original prices
  cabinCards.forEach((card) => {
    // Store original values as data attributes
    const originalPrice = Number.parseInt(card.dataset.perPerson);
    const wasPrice = Number.parseInt(
      card.querySelector(".was-price").textContent.match(/\d+/)[0]
    );
    const monthlyPayment = Number.parseInt(
      card.querySelector(".monthly").textContent.match(/\d+/)[0]
    );

    card.dataset.originalPrice = originalPrice;
    card.dataset.originalWasPrice = wasPrice;
    card.dataset.originalMonthly = monthlyPayment;
  });

  function formatPrice(price, includePrefix = true, includeSuffix = true) {
    return `${includePrefix ? "£" : ""}${price}${includeSuffix ? "pp" : ""}`;
  }

  function updatePrices() {
    const isTotal = priceToggle.checked;
    const passengers = Number.parseInt(passengerCount.value);

    cabinCards.forEach((card) => {
      const originalPrice = Number.parseInt(card.dataset.originalPrice);
      const originalWasPrice = Number.parseInt(card.dataset.originalWasPrice);
      const originalMonthly = Number.parseInt(card.dataset.originalMonthly);

      const priceSpan = card.querySelector(".from-price span");
      const wasPrice = card.querySelector(".was-price");
      const monthlyPayment = card.querySelector(".monthly");

      if (!isTotal) {
        // Calculate total prices
        const totalPrice = originalPrice * passengers;
        const totalWasPrice = originalWasPrice * passengers;
        const totalMonthly = originalMonthly * passengers;

        // Update display
        priceSpan.textContent = formatPrice(totalPrice, true, false);
        wasPrice.textContent = `WAS ${formatPrice(totalWasPrice, true, false)}`;
        monthlyPayment.textContent = `Monthly payments from ${formatPrice(
          totalMonthly,
          true,
          false
        )}`;
      } else {
        // Show per person prices
        priceSpan.textContent = formatPrice(originalPrice, true, false);
        wasPrice.textContent = `WAS ${formatPrice(
          originalWasPrice,
          true,
          true
        )}`;
        monthlyPayment.textContent = `Monthly payments from ${formatPrice(
          originalMonthly,
          true,
          true
        )}`;
      }

      // Update the suffix for the main price
      const priceSuffix = priceSpan.nextSibling;
      if (priceSuffix) {
        priceSuffix.textContent = !isTotal ? "" : "pp";
      }
    });
  }

  // Initialize prices on page load
  updatePrices();

  // Event listeners for toggle and passenger count changes
  priceToggle.addEventListener("change", function () {
    if (this.checked) {
      // Reset passenger count to default (2) when switching to per person
      passengerCount.value = "2";
    }
    updatePrices();
  });
  passengerCount.addEventListener("change", updatePrices);

  // Tabs functionality
  const tabGroups = document.querySelectorAll(".tabs");
  tabGroups.forEach((group) => {
    const tabs = group.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        const tabType = this.dataset.tab;
        tabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // Handle FLY CRUISE tab selection
        if (tabType === "fly") {
          handleFlyCruiseSelection(true);
        } else if (tabType === "cruise") {
          handleFlyCruiseSelection(false);
        }
      });
    });
  });

  function handleFlyCruiseSelection(isFlyCruise) {
    cabinCards.forEach((card) => {
      const priceElements = card.querySelectorAll(
        ".was-price, .from-price, .monthly"
      );
      const callPrice = card.querySelector(".call-price");
      const innerLink = document.querySelectorAll(".inner-link");
      if (isFlyCruise) {
        // Hide price information and show CALL text
        priceElements.forEach((el) => el.classList.add("hidden"));
        callPrice.classList.remove("hidden");
        innerLink.forEach((el) => (el.href = "/"));
      } else {
        // Show price information and hide CALL text
        priceElements.forEach((el) => el.classList.remove("hidden"));
        callPrice.classList.add("hidden");

        // Update prices to current state

        updatePrices();
      }
    });
  }

  // Cabin card selection
  cabinCards.forEach((card) => {
    card.addEventListener("click", function () {
      cabinCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  // Add tooltip functionality
  const infoIcons = document.querySelectorAll(".info-icon");
  let activeTooltip = null;
  let overlay = null;

  function createOverlay() {
    overlay = document.createElement("div");
    overlay.className = "tooltip-overlay";
    document.body.appendChild(overlay);
  }

  function showTooltip(tooltip, icon) {
    // Hide any active tooltip first
    hideActiveTooltip();

    // Position the tooltip
    const iconRect = icon.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    tooltip.style.top = `${iconRect.bottom + scrollTop + 12}px`;
    tooltip.style.left = `${iconRect.left - 160}px`; // Center the tooltip

    // Show tooltip and overlay
    tooltip.classList.add("show");
    overlay.classList.add("show");
    activeTooltip = tooltip;

    // Adjust position if tooltip is off-screen
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
    }
    if (tooltipRect.left < 0) {
      tooltip.style.left = "20px";
    }
  }

  function hideActiveTooltip() {
    if (activeTooltip) {
      activeTooltip.classList.remove("show");
      overlay.classList.remove("show");
      activeTooltip = null;
    }
  }

  // Create overlay
  createOverlay();

  // Setup event listeners for info icons
  infoIcons.forEach((icon) => {
    const tooltipId = `${icon.dataset.tooltip}-tooltip`;
    const tooltip = document.getElementById(tooltipId);

    // Show on hover
    icon.addEventListener("mouseenter", () => {
      showTooltip(tooltip, icon);
    });

    // Show on click (for mobile)
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      showTooltip(tooltip, icon);
    });
  });

  // Hide tooltip when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tooltip") && !e.target.closest(".info-icon")) {
      hideActiveTooltip();
    }
  });

  // Hide tooltip when pressing escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideActiveTooltip();
    }
  });

  // Hide tooltip when scrolling
  document.addEventListener("scroll", () => {
    hideActiveTooltip();
  });

  // Prevent tooltip from closing when clicking inside it
  document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});
