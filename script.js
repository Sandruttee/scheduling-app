function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

const AIRTABLE_TOKEN =
  "patc0yXmJjN3pxChz.b6c20343d5e39716a6e6de61782fba38e0f97f9b2c7464fd4d2a10c031b9abe2";
const AIRTABLE_BASE_ID = "appQ24001pnPlpxeg";
const STAFF_TABLE_NAME = "Staff";

const airtableURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
  STAFF_TABLE_NAME
)}`;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("onclick").match(/'(.+?)'/)?.[1];
      if (id) showSection(id);
    });
  });

  function showSection(id) {
    const sections = document.querySelectorAll(".dashboard-section");
    sections.forEach((section) => {
      section.style.display = section.id === id ? "block" : "none";
    });
  }

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  const addUserForm = document.getElementById("addUserForm");
  if (addUserForm) {
    addUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const role = document.getElementById("role").value;
      const loginCode = document.getElementById("loginCode").value.trim();

      const fullName = `${firstName} ${lastName}`;

      const payload = {
        fields: {
          Name: fullName,
          Role: role,
          "Login Code": loginCode,
        },
      };

      try {
        const res = await fetch(airtableURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          document.getElementById("userMessage").textContent =
            "✅ Staff member added.";
          addUserForm.reset();
        } else {
          document.getElementById("userMessage").textContent =
            "❌ Error: " + (data?.error?.message || "Unknown error.");
        }
      } catch (err) {
        document.getElementById("userMessage").textContent =
          "❌ Network error: " + err.message;
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const adminCredentials = {
    username: "admin",
    password: "pass",
  };

  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("adminUsername").value.trim();
      const password = document.getElementById("adminPassword").value.trim();

      if (
        username === adminCredentials.username &&
        password === adminCredentials.password
      ) {
        window.location.href = "admin-dashboard.html";
      } else {
        document.getElementById("adminLoginMessage").textContent =
          "❌ Invalid admin credentials.";
      }
    });
  }
});

const staffLoginForm = document.getElementById("staffLoginForm");
if (staffLoginForm) {
  staffLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document
      .getElementById("staffUsername")
      .value.trim()
      .toLowerCase();
    const code = document.getElementById("staffCode").value.trim();

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${STAFF_TABLE_NAME}?filterByFormula=AND(LOWER(Name)='${username}', {Login Code}='${code}')`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.records.length > 0) {
        const record = data.records[0];
        const staffName = record.fields.Name;
        const staffId = record.id;

        localStorage.setItem("staffName", staffName);
        localStorage.setItem("staffId", staffId);

        window.location.href = "staff-dashboard.html";
      } else {
        document.getElementById("staffLoginMessage").textContent =
          "❌ Incorrect name or login code.";
      }
    } catch (err) {
      document.getElementById("staffLoginMessage").textContent =
        "❌ Error: " + err.message;
    }
  });
}
