// Use numeric constructors to avoid cross-browser timezone quirks
const INDEPENDENCE_DATE = new Date(1947, 7, 14); // Aug = monthIndex 7
const CENTENNIAL_DATE = new Date(2047, 7, 14);

// normalize a date to midnight local time
function normalizeToMidnight(d) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

// Function to calculate years with precision (full years)
function calculateYears(startDate, endDate) {
  const s = normalizeToMidnight(startDate);
  const e = normalizeToMidnight(endDate);
  let years = e.getFullYear() - s.getFullYear();
  const monthDiff = e.getMonth() - s.getMonth();
  const dayDiff = e.getDate() - s.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }
  return years;
}

// Function to calculate days between dates (floor of full days)
function calculateDays(startDate, endDate) {
  const s = normalizeToMidnight(startDate).getTime();
  const e = normalizeToMidnight(endDate).getTime();
  const diff = e - s;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Function to format date as "14th August, 1947"
function formatDateWithOrdinal(date) {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  let ordinal;
  if (day % 10 === 1 && day % 100 !== 11) {
    ordinal = "st";
  } else if (day % 10 === 2 && day % 100 !== 12) {
    ordinal = "nd";
  } else if (day % 10 === 3 && day % 100 !== 13) {
    ordinal = "rd";
  } else {
    ordinal = "th";
  }

  return `${day}${ordinal} ${month}, ${year}`;
}

// Get next Independence Day (returns formatted date + days)
function getNextIndependenceDay() {
  const today = normalizeToMidnight(new Date());
  const currentYear = today.getFullYear();
  let nextDay = new Date(currentYear, 7, 14);
  nextDay = normalizeToMidnight(nextDay);

  // if today is after the anniversary (strictly after), pick next year
  if (today > nextDay) {
    nextDay = new Date(currentYear + 1, 7, 14);
    nextDay = normalizeToMidnight(nextDay);
  }

  const daysUntil = calculateDays(today, nextDay);
  return `${formatDateWithOrdinal(nextDay)} (${daysUntil} days)`;
}

// Create a robust "years and days" countdown to CENTENNIAL_DATE:
function getCountdownText() {
  const today = normalizeToMidnight(new Date());
  // compute full years we can add to today without passing centennial
  let temp = new Date(today);
  let years = 0;
  while (true) {
    const next = new Date(
      temp.getFullYear() + 1,
      temp.getMonth(),
      temp.getDate()
    );
    if (next <= CENTENNIAL_DATE) {
      temp = next;
      years += 1;
    } else {
      break;
    }
  }
  const days = calculateDays(temp, CENTENNIAL_DATE);
  return `${years} years and ${days} days AD until Pakistan's Centennial!`;
}

// Update all dynamic content
function updateContent() {
  const today = new Date();
  const years = calculateYears(INDEPENDENCE_DATE, today);
  const days = calculateDays(INDEPENDENCE_DATE, today);

  document.getElementById("years-old").textContent = `${years} Years`;
  document.getElementById(
    "days-old"
  ).textContent = `${days.toLocaleString()} Days`;
  document.getElementById("next-independence").textContent =
    getNextIndependenceDay();
  document.getElementById("countdown-text").textContent = getCountdownText();
  document.getElementById("last-updated").textContent =
    formatDateWithOrdinal(today) +
    " at " +
    today.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
}

// init
updateContent();
setInterval(updateContent, 60000);

// PDF generator: Complete implementation
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const today = new Date();
  const years = calculateYears(INDEPENDENCE_DATE, today);
  const days = calculateDays(INDEPENDENCE_DATE, today);

  // compute the same centennial years/days used on page
  let temp = normalizeToMidnight(today);
  let yearsUntilCentennial = 0;
  while (true) {
    const next = new Date(
      temp.getFullYear() + 1,
      temp.getMonth(),
      temp.getDate()
    );
    if (next <= CENTENNIAL_DATE) {
      temp = next;
      yearsUntilCentennial++;
    } else break;
  }
  const daysUntilCentennial = calculateDays(temp, CENTENNIAL_DATE);

  const darkGreen = [1, 65, 28];
  const lightGreen = [15, 103, 56];

  // Header
  doc.setFillColor(...darkGreen);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("Pakistan Independence", 105, 15, { align: "center" });
  doc.setFontSize(14);
  doc.text("Historical Dates & Centennial Information", 105, 25, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);
  let yPos = 50;

  // Independence Date Section
  doc.setFillColor(...lightGreen);
  doc.rect(10, yPos, 190, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("Independence Date", 15, yPos + 8);

  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("Gregorian Calendar:", 15, yPos);
  doc.text("14th August, 1947, Friday, Laylat-ul-Qadr", 15, yPos + 8);
  yPos += 15;
  doc.text("Islamic (Hijri) Calendar:", 15, yPos);
  doc.text("27th Ramadan, 1366 AH, Friday, Laylat-ul-Qadr", 15, yPos + 8);
  yPos += 25;

  // Current Age Section
  doc.setFillColor(...lightGreen);
  doc.rect(10, yPos, 190, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("Current Age", 15, yPos + 8);

  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Years Since Independence: ${years} Years`, 15, yPos);
  yPos += 8;
  doc.text(`Days Since Independence: ${days.toLocaleString()} Days`, 15, yPos);
  yPos += 8;
  doc.text(`Next Independence Day: ${getNextIndependenceDay()}`, 15, yPos);
  yPos += 20;

  // Centennial Section
  doc.setFillColor(...lightGreen);
  doc.rect(10, yPos, 190, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("100 Years Completion", 15, yPos + 8);

  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("Gregorian Calendar: 14th August, 2047", 15, yPos);
  yPos += 8;
  doc.text("Islamic (Hijri) Calendar: 27th Ramadan, 1466 AH", 15, yPos);
  yPos += 15;

  // Countdown
  doc.setFillColor(...darkGreen);
  doc.rect(10, yPos, 190, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(
    `${yearsUntilCentennial} years and ${daysUntilCentennial} days until Pakistan's Centennial!`,
    105,
    yPos + 8,
    { align: "center" }
  );

  // Footer
  yPos += 25;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("🌟 Pakistan Zindabad 🌟", 105, yPos, { align: "center" });
  doc.text(
    `Last updated: ${formatDateWithOrdinal(
      today
    )} at ${today.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    105,
    yPos + 10,
    { align: "center" }
  );

  doc.save("Pakistan_Independence_Dates.pdf");
}
// expose to onclick in markup
window.generatePDF = generatePDF;
