// API Configuration
const API_BASE_URL = 'https://your-api-endpoint.com/api';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('auth_token') // If using authentication
};

// DOM Elements
const testCaseList = document.getElementById("test-case-list");
const languageList = document.getElementById("language-list");
const questionList = document.getElementById("question-list");

// Initialize Dashboard
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([
      fetchTestCases(),
      fetchLanguages(),
      fetchQuestions()
    ]);
    updateStats();
  } catch (error) {
    console.error("Failed to initialize dashboard:", error);
    alert("Failed to load dashboard data. Please try again.");
  }
});

// API Fetch Functions
async function fetchTestCases() {
  try {
    const response = await fetch(`${API_BASE_URL}/test-cases`, { headers });
    if (!response.ok) throw new Error('Failed to fetch test cases');
    const data = await response.json();
    renderTestCases(data);
  } catch (error) {
    console.error("Error fetching test cases:", error);
    throw error;
  }
}

async function fetchLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`, { headers });
    if (!response.ok) throw new Error('Failed to fetch languages');
    const data = await response.json();
    renderLanguages(data);
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
}

async function fetchQuestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, { headers });
    if (!response.ok) throw new Error('Failed to fetch questions');
    const data = await response.json();
    renderQuestions(data);
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

// Update Quick Stats
function updateStats() {
  // These would be updated after the API calls complete
  const testCaseCount = document.querySelectorAll("#test-case-list tr").length;
  const enabledLangCount = document.querySelectorAll("#language-list .status.enabled").length;
  const questionCount = document.querySelectorAll("#question-list tr").length;
  
  document.getElementById("test-case-count").textContent = `${testCaseCount} Total`;
  document.getElementById("language-count").textContent = `${enabledLangCount} Enabled`;
  document.getElementById("question-count").textContent = `${questionCount} Total`;
}

// Render Functions (now take data parameter)
function renderTestCases(testCases) {
  testCaseList.innerHTML = testCases.map(testCase => `
    <tr>
      <td>${testCase.id}</td>
      <td>${testCase.name}</td>
      <td><span class="status ${testCase.status.toLowerCase()}">${testCase.status}</span></td>
      <td>
        <button class="btn-edit" onclick="editTestCase(${testCase.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteTestCase(${testCase.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function renderLanguages(languages) {
  languageList.innerHTML = languages.map(lang => `
    <tr>
      <td>${lang.name}</td>
      <td>${lang.code}</td>
      <td><span class="status ${lang.status.toLowerCase()}">${lang.status}</span></td>
      <td>${lang.isDefault ? "Yes" : "No"}</td>
      <td>
        <button class="btn-edit" onclick="editLanguage('${lang.code}')"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteLanguage('${lang.code}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function renderQuestions(questions) {
  questionList.innerHTML = questions.map(q => `
    <tr>
      <td>${q.id}</td>
      <td>${q.question}</td>
      <td>${q.category}</td>
      <td>
        <button class="btn-edit" onclick="editQuestion(${q.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" onclick="deleteQuestion(${q.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

// CRUD Operations
async function editTestCase(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/test-cases/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch test case');
    const testCase = await response.json();
    
    const content = `
      <div class="form-group">
        <label>Test Case Name</label>
        <input type="text" id="testCaseName" value="${testCase.name}" class="form-input">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="testCaseStatus" class="form-input">
          <option ${testCase.status === "Active" ? "selected" : ""}>Active</option>
          <option ${testCase.status === "Inactive" ? "selected" : ""}>Inactive</option>
        </select>
      </div>
    `;
    
    openModal("Edit Test Case", content, async () => {
      const updatedData = {
        name: document.getElementById("testCaseName").value,
        status: document.getElementById("testCaseStatus").value
      };
      
      const updateResponse = await fetch(`${API_BASE_URL}/test-cases/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData)
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update test case');
      await fetchTestCases();
      updateStats();
    });
  } catch (error) {
    console.error("Error editing test case:", error);
    alert("Failed to edit test case. Please try again.");
  }
}

async function deleteTestCase(id) {
  if (!confirm("Are you sure you want to delete this test case?")) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/test-cases/${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) throw new Error('Failed to delete test case');
    await fetchTestCases();
    updateStats();
  } catch (error) {
    console.error("Error deleting test case:", error);
    alert("Failed to delete test case. Please try again.");
  }
}

// Modified openModal to support save callback
function openModal(title, content, onSave = null) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = content;
  document.getElementById("modal").classList.remove("hidden");
  
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-save";
  saveBtn.innerHTML = "<i class='fas fa-save'></i> Save";
  saveBtn.onclick = async () => {
    try {
      if (onSave) await onSave();
      closeModal();
    } catch (error) {
      console.error("Save operation failed:", error);
      alert("Failed to save changes. Please try again.");
    }
  };
  
  document.getElementById("modal-body").appendChild(saveBtn);
}

// Similar implementations for languages and questions...
// You would create editLanguage, deleteLanguage, editQuestion, deleteQuestion functions
// following the same pattern as editTestCase and deleteTestCase