// --- MOCK DATABASE (Add more students here) ---
const STUDENT_DB = [
    { lrn: "130005120637", name: "Kzyube N. Napoles", grade: "7", section: "Maxwell" },
    { lrn: "123456789000", name: "Juan Dela Cruz", grade: "8", section: "Rizal" },
    { lrn: "111222333444", name: "Maria Clara", grade: "9", section: "Silang" }
];

// --- FEATURE: LOGIN / LRN CHECK ---
function verifyLRN() {
    const inputLRN = document.getElementById('lrnInput').value.trim();
    const errorMsg = document.getElementById('loginError');
    
    // Find student in DB
    const student = STUDENT_DB.find(s => s.lrn === inputLRN);

    if (student) {
        // Save to Session Storage (Temporary memory while browser is open)
        sessionStorage.setItem('currentUser', JSON.stringify(student));
        
        // Hide Login Modal
        const loginModalEl = document.getElementById('loginModal');
        const modal = bootstrap.Modal.getInstance(loginModalEl);
        modal.hide();

        // Refresh page to show content
        window.location.reload(); 
    } else {
        errorMsg.classList.remove('d-none');
        errorMsg.innerText = "Invalid LRN. Please check and try again.";
    }
}

// --- CHECK LOGIN STATUS ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const path = window.location.pathname;

    // A. Logic for 'learn.html'
    if (path.includes('learn.html')) {
        if (user) {
            // User is Logged In: Show Content
            document.getElementById('loginTrigger').classList.add('d-none'); // Hide login btn
            document.getElementById('welcomeBanner').classList.remove('d-none'); // Show banner
            document.getElementById('studentNameDisplay').innerText = `Welcome, ${user.name} (${user.grade} - ${user.section})`;
            document.getElementById('subjectSelection').classList.remove('d-none'); // Show subjects
        } else {
            // User is NOT Logged In: Show Modal
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // --- FEATURE 1: QUIZ LOGIC ---
    const quizBtn = document.getElementById('submitQuiz');
    if (quizBtn) {
        quizBtn.addEventListener('click', checkMathQuiz);
    }

    // --- FEATURE 2: RECEIPT GENERATION ---
    const ticketBtn = document.getElementById('generateTicketBtn');
    if (ticketBtn) {
        ticketBtn.addEventListener('click', generateReceipt);
    }

});

// --- MATH QUIZ FUNCTION ---
function checkMathQuiz() {
    let score = 0;
    const form = document.forms['mathQuiz'];
    if (!form) return; 

    const q1 = form.querySelector('input[name="q1"]:checked');
    if (q1 && q1.value === '3') score++;

    const q2 = form.querySelector('input[name="q2"]:checked');
    if (q2 && q2.value === '5') score++;

    const resultDiv = document.getElementById('quizResult');
    
    if (score === 2) {
        resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> Perfect! You scored ${score}/2.`;
        resultDiv.className = "mt-3 fw-bold text-success p-3 bg-light border border-success rounded";
    } else {
        resultDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> You scored ${score}/2. Try again!`;
        resultDiv.className = "mt-3 fw-bold text-danger p-3 bg-light border border-danger rounded";
    }
}

// --- HELPER: Convert Image URL to Base64 ---
function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = () => {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = () => {
            resolve(null);
        };
        img.src = url;
    });
}

// --- MAIN FUNCTION: Generate Professional PDF (UPDATED) ---
async function generateReceipt() {
    if (!window.jspdf) {
        alert("Error: PDF Library not loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Get Values
    const name = document.getElementById('stName').value.trim();
    const id = document.getElementById('stID').value.trim();
    const type = document.getElementById('issueType').value;
    const desc = document.getElementById('issueDesc').value.trim();
    
    // --- KEY UPDATE: Get the Smart Field Value ---
    const smartVal = document.getElementById('smartInput').value.trim();
    
    // Create 'finalDescription' combining both inputs
    let finalDescription = desc;
    if (smartVal) {
        finalDescription = `[SPECIFIC DETAILS: ${smartVal}]\n\n` + desc;
    }
    // ---------------------------------------------

    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    const ticketID = "TKT-" + Math.floor(Math.random() * 10000) + "-" + new Date().getFullYear();

    if (!name || !id || !desc || !type) {
        alert("Please fill in all fields.");
        return;
    }

    // 2. Load Logo
    const logoBase64 = await getBase64ImageFromURL('images/logoOSIAS.png');

    // ================= DESIGN START =================

    // --- A. BORDERS & BACKGROUND ---
    doc.setDrawColor(13, 71, 161); // Primary Blue Border
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 200, 287); // Page Border

    // --- B. HEADER (Letterhead Style) ---
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 15, 25, 25);
    }
    
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(13, 71, 161); // Dark Blue
    doc.text("OSIAS HIGH SCHOOL", 45, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100); // Grey
    doc.text("Poblacion, Kabacan, Cotabato | Tel: (064) 123-4567", 45, 32);
    doc.text("Office of the Student Registrar & Support", 45, 37);

    // Divider Line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // --- C. TITLE BAR ---
    doc.setFillColor(13, 71, 161); // Blue Fill
    doc.rect(15, 55, 180, 12, 'F');
    
    doc.setTextColor(255, 255, 255); // White Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("OFFICIAL REQUEST RECEIPT", 105, 63, null, null, "center");

    // --- D. TWO-COLUMN INFO GRID ---
    doc.setTextColor(0); // Reset to black
    
    // Left Column: Student Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT DETAILS", 20, 85);
    
    doc.setFont("helvetica", "normal");
    doc.text("Name:", 20, 95);
    doc.text("Student ID:", 20, 105);
    
    doc.setFont("helvetica", "bold");
    doc.text(name.toUpperCase(), 50, 95);
    doc.text(id, 50, 105);

    // Right Column: Ticket Info
    doc.text("TICKET DETAILS", 120, 85);
    
    doc.setFont("helvetica", "normal");
    doc.text("Date:", 120, 95);
    doc.text("Time:", 120, 105);
    doc.text("Category:", 120, 115);

    doc.setFont("helvetica", "bold");
    doc.text(dateStr, 145, 95);
    doc.text(timeStr, 145, 105);
    doc.setTextColor(13, 71, 161); // Blue for Category
    doc.text(type, 145, 115);
    doc.setTextColor(0); // Reset

    // --- E. BIG TICKET NUMBER ---
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245); // Very light grey
    doc.roundedRect(120, 125, 75, 20, 2, 2, 'FD');

    doc.setFont("courier", "bold"); // Monospace for Code look
    doc.setFontSize(14);
    doc.text("REF NO:", 125, 137);
    doc.setTextColor(200, 0, 0); // Red color for ID
    doc.text(ticketID, 150, 137);

    // --- F. DESCRIPTION BOX (Using finalDescription) ---
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REQUEST SPECIFICS / DESCRIPTION:", 20, 160);

    // Background for description
    doc.setFillColor(250, 250, 250); 
    doc.setDrawColor(220);
    doc.rect(20, 165, 170, 50, 'FD');

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    
    // USE THE COMBINED TEXT HERE
    const splitDesc = doc.splitTextToSize(finalDescription, 160);
    doc.text(splitDesc, 25, 175);

    // --- G. FOOTER ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Authorized Signature:", 130, 240);
    doc.line(130, 255, 190, 255); // Signature Line
    
    // Bottom Watermark/Note
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This document is system-generated by the Osias High School Portal.", 105, 275, null, null, "center");
    doc.text("Valid for 30 days from date of issue.", 105, 280, null, null, "center");

    // Save
    const cleanType = type.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`${ticketID}_${cleanType}.pdf`);
}

// --- FEATURE 2: SMART FIELDS LOGIC (UI) ---
function handleSmartFields() {
    // 1. Get elements
    const category = document.getElementById('issueType').value;
    const container = document.getElementById('smartFieldContainer');
    const label = document.getElementById('smartLabel');
    const input = document.getElementById('smartInput');

    // 2. Reset (Hide first, clear old values)
    container.classList.add('d-none');
    input.value = ""; 

    // 3. Check Category and Update
    if (category === "Grade Discrepancy") {
        container.classList.remove('d-none'); 
        label.innerText = "Which Subject & Quarter?"; 
        input.placeholder = "e.g., Mathematics 10, 2nd Quarter"; 
        input.focus(); 
        
    } else if (category === "ID Replacement") {
        container.classList.remove('d-none');
        label.innerText = "Reason for Replacement?";
        input.placeholder = "e.g., ID Lost, Damaged, or Photo update";
        input.focus();

    } else if (category === "Enrollment Issue") {
        container.classList.remove('d-none');
        label.innerText = "Last Grade Level Attended?";
        input.placeholder = "e.g., Grade 9 - Section Rizal";
        input.focus();
    }
}

// --- FEATURE 3: GWA CALCULATOR ---

function addGradeRow() {
    const container = document.getElementById('gradeInputs');
    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col-7">
            <input type="text" class="form-control" placeholder="Subject Name (Optional)">
        </div>
        <div class="col-5">
            <input type="number" class="form-control grade-val" placeholder="Grade" min="60" max="100">
        </div>
    `;
    container.appendChild(div);
}

function calculateGWA() {
    const inputs = document.querySelectorAll('.grade-val');
    let total = 0;
    let count = 0;

    inputs.forEach(input => {
        const val = parseFloat(input.value);
        if (val && val > 0) {
            total += val;
            count++;
        }
    });

    const resultBox = document.getElementById('gwaResult');
    resultBox.classList.remove('d-none'); // Show the box

    if (count === 0) {
        resultBox.className = "mt-4 p-3 rounded text-center bg-danger text-white";
        resultBox.innerText = "Please enter at least one grade.";
        return;
    }

    const average = (total / count).toFixed(2); // Round to 2 decimals

    // Logic for Honor Roll
    if (average >= 90) {
        resultBox.className = "mt-4 p-3 rounded text-center bg-success text-white";
        resultBox.innerHTML = `<h3>🎉 ${average}</h3><p class="mb-0">Congratulations! You are eligible for the Honor Roll.</p>`;
    } else if (average < 75) {
        resultBox.className = "mt-4 p-3 rounded text-center bg-warning text-dark";
        resultBox.innerHTML = `<h3>${average}</h3><p class="mb-0">Please visit the Guidance Office for academic support.</p>`;
    } else {
        resultBox.className = "mt-4 p-3 rounded text-center bg-info text-white";
        resultBox.innerHTML = `<h3>${average}</h3><p class="mb-0">Keep up the good work!</p>`;
    }
}

// --- FEATURE 5: GLOBAL DARK MODE TOGGLE ---
// We wrap this in a function to ensure variables don't conflict
function initDarkMode() {
    console.log("Dark Mode Script Running..."); // Debug check

    const toggleBtn = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Check if button exists on this page
    if (!toggleBtn) {
        console.log("Dark Mode Button NOT found on this page.");
        return; // Stop if no button
    }
    
    const icon = toggleBtn.querySelector('i');

    // 1. Apply Saved Preference on Load
    if (localStorage.getItem('osiasTheme') === 'dark') {
        body.classList.add('dark-mode');
        if(icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // 2. Add Click Event Listener
    toggleBtn.addEventListener('click', () => {
        console.log("Toggle Clicked!"); // Debug check

        body.classList.toggle('dark-mode');

        // Save preference & Update Icon
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('osiasTheme', 'dark');
            if(icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else {
            localStorage.setItem('osiasTheme', 'light');
            if(icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', initDarkMode);