// Initialize localStorage if it is not already initialized
if (!localStorage.getItem("tasks")) {
  localStorage.setItem("tasks", JSON.stringify([]));
}
if (!localStorage.getItem("nextId")) {
  localStorage.setItem("nextId", JSON.stringify(1));
}

// Retrieve tasks and nextId from localStorage with error handling
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Log initial task list for debugging
// console.log('Initial task list:', taskList);

// Create a task card
function createTaskCard(task) {
  // console.log('Creating task card for:', task);
  const taskCard = $(`
    <div class="card mb-2 task-card" data-id="${task.id}" style="background-color: ${getCardColor(task.status)};">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${dayjs(task.dueDate).format('MMM D, YYYY')}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  console.log('Appending task card to:', `#${task.status}-cards`);
  // Append the task card to the appropriate lane
  const newTaskCard = $(`#${task.status}-cards`);
  console.log (newTaskCard);
  $(`#${task.status}-cards`).append(taskCard);
}

// Get card color based on status
function getCardColor(status) {
  console.log(status);
  let color = '';
  switch (status) {
    case 'to-do':
      color = 'red';
    case 'in-progress':
      color = 'yellow';
    case 'done':
      color = 'white';
    default:
      color = 'lightgray';
  }

  return color;
}

// Render the task list and make cards draggable
function renderTaskList() {
  console.log('Rendering task list...');
  // $('.lane .card-body').empty();
  taskList.forEach(createTaskCard);

  // Make task cards draggable
  $('.task-card').draggable({
    revert: 'invalid',
    helper: 'clone',
    start: function () { $(this).hide(); },
    stop: function () { $(this).show(); }
  });

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  console.log('Adding new task...');

  const title = $('#task-title').val().trim();
  const description = $('#task-description').val().trim();
  const dueDate = $('#task-due-date').val();

  console.log('Task details:', { title, description, dueDate });

  if (title && description && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: 'to-do'
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', JSON.stringify(nextId));

    $('#formModal').modal('hide');
    renderTaskList();
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('id');
  const newStatus = $(this).attr('id').replace('-cards', '');

  const task = taskList.find(task => task.id === taskId);
  task.status = newStatus;

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Clear all tasks
function clearAllTasks() {
  taskList = [];
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#task-form').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);
  $('#task-due-date').datepicker();

  // Add event listener to clear all tasks
  $('#clear-tasks-btn').on('click', clearAllTasks);
});

// Generate a new task ID
function generateTaskId() {
  const id = nextId++;
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return id;
}
