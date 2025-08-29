// State
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let editingId = null;
let sortBy = null;

// DOM Elements
const todoForm = document.getElementById("todoForm");
const titleInput = document.getElementById("title");
const dueDateInput = document.getElementById("dueDate");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const searchInput = document.getElementById("searchText");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortDateBtn = document.getElementById("sortDate");
const sortTitleBtn = document.getElementById("sortTitle");
const todoList = document.getElementById("todoList");
const completeSound = document.getElementById("completeSound");

// Initialize
renderTodos();

// Event Listeners
todoForm.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", renderTodos);
statusFilter.addEventListener("change", renderTodos);
categoryFilter.addEventListener("change", renderTodos);
sortDateBtn.addEventListener("click", () => {
  sortBy = "date";
  renderTodos();
});
sortTitleBtn.addEventListener("click", () => {
  sortBy = "title";
  renderTodos();
});

// Handle Form Submission (Create/Update)
function handleSubmit(e) {
  e.preventDefault();

  const todo = {
    id: editingId || Date.now().toString(),
    title: titleInput.value,
    dueDate: dueDateInput.value,
    category: categoryInput.value,
    description: descriptionInput.value,
    status: "incomplete",
    history: [],
  };

  // If editing, update; else add new
  if (editingId) {
    const existingTodo = todos.find(t => t.id === editingId);
    if (existingTodo) {
      // Save old version to history (Bonus #2)
      todo.history = [...existingTodo.history, {
        timestamp: new Date().toISOString(),
        changes: { ...existingTodo }
      }];
      Object.assign(existingTodo, todo);
    }
    editingId = null;
  } else {
    todos.push(todo);
  }

  saveToLocalStorage();
  renderTodos();
  todoForm.reset();
}

// Render Todos (with Filtering & Sorting)
function renderTodos() {
  const searchText = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const category = categoryFilter.value;

  // Filter
  let filteredTodos = todos.filter(todo => {
    return (
      todo.title.toLowerCase().includes(searchText) &&
      (status === "all" || todo.status === status) &&
      (category === "all" || todo.category === category)
    );
  });

  // Sort
  if (sortBy === "date") {
    filteredTodos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === "title") {
    filteredTodos.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Render
  todoList.innerHTML = filteredTodos.map(todo => `
    <div class="todo-item ${todo.status === "complete" ? "complete" : ""}" id="${todo.id}">
      <h3>${todo.title}</h3>
      <p class="due-date">Due: ${todo.dueDate}</p>
      <p><strong>Category:</strong> ${todo.category}</p>
      <p>${todo.description}</p>
      <div class="actions">
        <button onclick="toggleComplete('${todo.id}')">
          ${todo.status === "complete" ? "Undo" : "Complete"}
        </button>
        <button onclick="editTodo('${todo.id}')">Edit</button>
        <button onclick="deleteTodo('${todo.id}')">Delete</button>
        ${todo.history.length > 0 ? `<button onclick="showHistory('${todo.id}')">History</button>` : ""}
      </div>
    </div>
  `).join("");
}

// Toggle Complete Status (with Reward - Bonus #1)
function toggleComplete(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  todo.status = todo.status === "complete" ? "incomplete" : "complete";

  if (todo.status === "complete") {
    // Play sound
    completeSound.play();

    // Add confetti effect
    const todoElement = document.getElementById(id);
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      todoElement.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1000);
    }
  }

  saveToLocalStorage();
  renderTodos();
}

// Edit Todo
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  editingId = id;
  titleInput.value = todo.title;
  dueDateInput.value = todo.dueDate;
  categoryInput.value = todo.category;
  descriptionInput.value = todo.description;
}

// Delete Todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveToLocalStorage();
  renderTodos();
}

// Show History (Bonus #2)
function showHistory(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const historyHTML = todo.history.map((entry, index) => `
    <div style="margin-bottom: 10px; padding: 10px; background: #f9f9f9;">
      <h4>Version ${index + 1} (${new Date(entry.timestamp).toLocaleString()})</h4>
      <p><strong>Title:</strong> ${entry.changes.title}</p>
      <p><strong>Due Date:</strong> ${entry.changes.dueDate}</p>
      <p><strong>Category:</strong> ${entry.changes.category}</p>
      <p><strong>Description:</strong> ${entry.changes.description}</p>
      <p><strong>Status:</strong> ${entry.changes.status}</p>
    </div>
  `).join("");

  alert(`History for: ${todo.title}\n\n${historyHTML || "No history yet."}`);
}

// Save to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}