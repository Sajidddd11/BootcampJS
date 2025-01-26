// Task Management Application

class TaskManager {
    constructor() {
      this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
      this.render()
      this.setupEventListeners()
    }
  
    // Generate a unique ID for tasks
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  
    // Add a new task
    async addTask(title, description, priority) {
      try {
        const newTask = {
          id: this.generateId(),
          title,
          description,
          priority,
          completed: false,
          createdAt: new Date(),
        }
  
        this.tasks.push(newTask)
        await this.saveToLocalStorage()
        this.render()
      } catch (error) {
        console.error("Error adding task:", error)
      }
    }
  
    // Delete a task by ID
    async deleteTask(taskId) {
      try {
        this.tasks = this.tasks.filter((task) => task.id !== taskId)
        await this.saveToLocalStorage()
        this.render()
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  
    // Update an existing task
    async updateTask(taskId, updates) {
      try {
        const taskIndex = this.tasks.findIndex((task) => task.id === taskId)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates }
          await this.saveToLocalStorage()
          this.render()
        }
      } catch (error) {
        console.error("Error updating task:", error)
      }
    }
  
    // Toggle task completion status
    async toggleTaskCompletion(taskId) {
      try {
        const task = this.tasks.find((task) => task.id === taskId)
        if (task) {
          task.completed = !task.completed
          await this.saveToLocalStorage()
          this.render()
        }
      } catch (error) {
        console.error("Error toggling task completion:", error)
      }
    }
  
    // Save tasks to localStorage
    async saveToLocalStorage() {
      try {
        localStorage.setItem("tasks", JSON.stringify(this.tasks))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  
    // Render tasks to the DOM
    render() {
      const taskList = document.getElementById("taskList")
      taskList.innerHTML = ""
  
      this.tasks.forEach((task) => {
        const taskElement = document.createElement("div")
        taskElement.className = `task-item ${task.completed ? "task-completed" : ""}`
        taskElement.innerHTML = `
          <div>
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <span>Priority: ${task.priority}</span>
          </div>
          <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}">${task.completed ? "Undo" : "Complete"}</button>
            <button class="delete-btn" data-id="${task.id}">Delete</button>
          </div>
        `
        taskList.appendChild(taskElement)
      })
    }
  
    // Set up event listeners
    setupEventListeners() {
      const taskForm = document.getElementById("taskForm")
      const taskList = document.getElementById("taskList")
  
      taskForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const title = document.getElementById("taskTitle").value
        const description = document.getElementById("taskDescription").value
        const priority = document.getElementById("taskPriority").value
  
        if (title.trim() !== "") {
          this.addTask(title, description, priority)
          taskForm.reset()
        }
      })
  
      taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("complete-btn")) {
          const taskId = e.target.getAttribute("data-id")
          this.toggleTaskCompletion(taskId)
        } else if (e.target.classList.contains("delete-btn")) {
          const taskId = e.target.getAttribute("data-id")
          this.deleteTask(taskId)
        }
      })
    }
  
    // Bonus: Task filtering
    filterTasks(filterType) {
      let filteredTasks
      switch (filterType) {
        case "completed":
          filteredTasks = this.tasks.filter((task) => task.completed)
          break
        case "active":
          filteredTasks = this.tasks.filter((task) => !task.completed)
          break
        default:
          filteredTasks = this.tasks
      }
      this.renderFilteredTasks(filteredTasks)
    }
  
    // Bonus: Task sorting
    sortTasks(sortType) {
      switch (sortType) {
        case "priority":
          this.tasks.sort((a, b) => {
            const priorityOrder = { low: 1, medium: 2, high: 3 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          })
          break
        case "date":
          this.tasks.sort((a, b) => b.createdAt - a.createdAt)
          break
      }
      this.render()
    }
  
    // Bonus: Task search
    searchTasks(query) {
      const filteredTasks = this.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.description.toLowerCase().includes(query.toLowerCase()),
      )
      this.renderFilteredTasks(filteredTasks)
    }
  
    // Helper method to render filtered tasks
    renderFilteredTasks(filteredTasks) {
      const taskList = document.getElementById("taskList")
      taskList.innerHTML = ""
  
      filteredTasks.forEach((task) => {
        // ... (same as in the render method)
      })
    }
  }
  
  // Initialize the TaskManager
  const taskManager = new TaskManager()
  
  // Expose taskManager to the global scope for testing purposes
  window.taskManager = taskManager
  
  