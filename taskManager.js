class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
    this.editingTaskId = null
    this.lastFilter = null
    this.lastSort = "dueDate"
    this.render()
    this.setupEventListeners()
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async addTask(title, description, priority, dueDate) {
    try {
      const newTask = {
        id: this.generateId(),
        title,
        description,
        priority,
        dueDate,
        completed: false,
      }
      this.tasks.push(newTask)
      await this.saveToLocalStorage()
      this.applyState()
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  async deleteTask(taskId) {
    try {
      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      await this.saveToLocalStorage()
      this.applyState()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  async updateTask(taskId, updates) {
    try {
      this.tasks = this.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      )
      await this.saveToLocalStorage()
      this.applyState()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  async toggleTaskCompletion(taskId) {
    try {
      this.tasks = this.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
      await this.saveToLocalStorage()
      this.applyState()
    } catch (error) {
      console.error("Error toggling completion:", error)
    }
  }

  async saveToLocalStorage() {
    try {
      localStorage.setItem("tasks", JSON.stringify(this.tasks))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  enableEditMode(taskId) {
    this.editingTaskId = taskId
    this.render()
  }

  cancelEdit() {
    this.editingTaskId = null
    this.render()
  }

  saveEditedTask(taskId) {
    const titleInput = document.getElementById(`edit-title-${taskId}`)
    const descInput = document.getElementById(`edit-description-${taskId}`)
    const prioritySelect = document.getElementById(`edit-priority-${taskId}`)
    const dueDateInput = document.getElementById(`edit-due-${taskId}`)

    if (titleInput && titleInput.value.trim() !== "") {
      this.updateTask(taskId, {
        title: titleInput.value.trim(),
        description: descInput.value || "",
        priority: prioritySelect.value || "low",
        dueDate: dueDateInput.value || "",
      })
    }
    this.editingTaskId = null
  }

  render() {
    const taskList = document.getElementById("taskList")
    if (!taskList) return
    taskList.innerHTML = ""

    this.tasks.forEach((task) => {
      const taskElement = document.createElement("div")
      taskElement.classList.add("task-item")
      if (task.completed) taskElement.classList.add("task-completed")

      if (task.id === this.editingTaskId) {
        taskElement.classList.add("editing")
        taskElement.innerHTML = `
          <div>
            <input type="text" id="edit-title-${task.id}" value="${task.title}" />
            <textarea id="edit-description-${task.id}">${task.description}</textarea>
            <select id="edit-priority-${task.id}">
              <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
              <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
              <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
            </select>
            <input type="date" id="edit-due-${task.id}" value="${task.dueDate || ""}" />
          </div>
          <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}">Complete</button>
            <button class="save-edit-btn" data-id="${task.id}">Save</button>
            <button class="cancel-edit-btn" data-id="${task.id}">Cancel</button>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
          </div>
        `
      } else {
        taskElement.innerHTML = `
          <div>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <span>Priority: ${task.priority}</span>
            <span>Due Date: ${task.dueDate || "N/A"}</span>
          </div>
          <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}">Complete</button>
            <button class="edit-btn" data-id="${task.id}">Edit</button>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
          </div>
        `
      }
      taskList.appendChild(taskElement)
    })
  }

  setupEventListeners() {
    const taskForm = document.getElementById("taskForm")
    const taskList = document.getElementById("taskList")
    const searchField = document.getElementById("searchField")

    if (taskForm) {
      taskForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const title = document.getElementById("taskTitle").value
        const description = document.getElementById("taskDescription").value
        const priority = document.getElementById("taskPriority").value
        const dueDate = document.getElementById("taskDueDate").value
        if (title.trim() !== "") {
          this.addTask(title, description, priority, dueDate)
        }
      })
    }

    if (taskList) {
      taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("complete-btn")) {
          this.toggleTaskCompletion(e.target.dataset.id)
        } else if (e.target.classList.contains("delete-btn")) {
          this.deleteTask(e.target.dataset.id)
        } else if (e.target.classList.contains("edit-btn")) {
          this.enableEditMode(e.target.dataset.id)
        } else if (e.target.classList.contains("save-edit-btn")) {
          this.saveEditedTask(e.target.dataset.id)
        } else if (e.target.classList.contains("cancel-edit-btn")) {
          this.cancelEdit()
        }
      })
    }

    if (searchField) {
      searchField.addEventListener("input", () => {
        this.lastFilter = null
        const query = searchField.value
        this.searchTasks(query)
      })
    }
  }

  filterTasks(filterType) {
    this.lastFilter = filterType
    this.applyState()
  }

  sortTasks(sortType) {
    this.lastSort = sortType
    this.applyState()
  }

  searchTasks(query) {
    const filteredTasks = this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
    )
    this.renderFilteredTasks(filteredTasks)
  }

  renderFilteredTasks(filteredTasks) {
    const taskList = document.getElementById("taskList")
    if (!taskList) return
    taskList.innerHTML = ""

    filteredTasks.forEach((task) => {
      const taskElement = document.createElement("div")
      taskElement.classList.add("task-item")
      if (task.completed) taskElement.classList.add("task-completed")
      taskElement.innerHTML = `
        <div>
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <span>Priority: ${task.priority}</span>
          <span>Due Date: ${task.dueDate || "N/A"}</span>
        </div>
        <div class="task-actions">
          <button class="complete-btn" data-id="${task.id}">Complete</button>
          <button class="edit-btn" data-id="${task.id}">Edit</button>
          <button class="delete-btn" data-id="${task.id}">Delete</button>
        </div>
      `
      taskList.appendChild(taskElement)
    })
  }

  applyState() {
    if (this.lastSort) {
      switch (this.lastSort) {
        case "priority":
          this.tasks.sort((a, b) => {
            const priorities = { low: 1, medium: 2, high: 3 }
            return priorities[b.priority] - priorities[a.priority]
          })
          break
        case "dueDate":
          this.tasks.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000)
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000)
            const dateDiff = dateA - dateB
            if (dateDiff !== 0) return dateDiff

            const priorities = { low: 1, medium: 2, high: 3 }
            return priorities[b.priority] - priorities[a.priority]
          })
          break
        default:
          break
      }
    }

    if (this.lastFilter) {
      let filtered = []
      switch (this.lastFilter) {
        case "completed":
          filtered = this.tasks.filter((task) => task.completed)
          break
        case "incomplete":
          filtered = this.tasks.filter((task) => !task.completed)
          break
        default:
          filtered = [...this.tasks]
          break
      }
      this.renderFilteredTasks(filtered)
    } else {
      this.render()
    }
  }
}

const taskManager = new TaskManager()
window.taskManager = taskManager