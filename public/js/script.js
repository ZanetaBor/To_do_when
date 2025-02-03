/* Weather panel */
async function fetchWeather() {
    try {
        const response = await fetch('/weather');
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const weatherData = await response.json();
        const weatherInfoElement = document.querySelector('.weather-info');
        weatherInfoElement.innerHTML = `
            <p>Temperature: ${weatherData.main.temp} &deg;C</p>
            <p>Description: ${weatherData.weather[0].description}</p>
        `;
    } catch (error) {
        console.error(error);
        const weatherInfoElement = document.querySelector('.weather-info');
        weatherInfoElement.innerHTML = '<p>Failed to load weather data</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchTasks(); //add task function
    fetchWeather(); // weather function
});

let isFiltered = false;
let isSorted = false;

function filterTasks(tasks) {
    return tasks.filter(task => task.completed);
}
function sortTasks(tasks) {
    return tasks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
}

async function fetchTasks() {
    try {
        const response = await fetch('/tasks');
        if (!response.ok) {
            console.error('Failed to fetch tasks');
            return;
        }
        let tasks = await response.json();

        if (isSorted) {
            tasks = sortTasks(tasks);
        }

        if (isFiltered) {
            tasks = filterTasks(tasks)
        } 

        const tasksContainer = document.querySelector('.list-items');
        tasksContainer.innerHTML = ''; // Clear existing tasks

        tasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.className = 'task-item';
            console.log(task);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                updateTaskCompletion(task.id, checkbox.checked);
            });

            const taskTitle = document.createElement('span');
            taskTitle.textContent = task.title;

            taskElement.appendChild(checkbox);
            taskElement.appendChild(taskTitle);
            taskElement.dataset.taskId = task.id;
            tasksContainer.appendChild(taskElement);
        });
      
    } catch (error) {
        console.error(error);
    }
}

document.querySelector('.sort-tasks-btn').addEventListener('click', () => {
    isSorted = !isSorted; // Reverse sort
    fetchTasks(); // Get and sort tasks 
});

document.querySelector('.filter-tasks-btn').addEventListener('click', () => {
    isFiltered = !isFiltered;
    fetchTasks();
});

async function updateTaskCompletion(id, completed, dateAdded) {
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed, dateAdded })
        });
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        fetchTasks();
    } catch (error) {
        console.error(error);
    }
}

async function addTask(title) {
    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now(), 
                title: title,
                dateAdded: new Date().toISOString(), 
                completed: false 
            })
        });
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        fetchTasks(); 
    } catch (error) {
        console.error(error);
    }
}

async function removeTask(id) {
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to remove task');
        }
        fetchTasks();
    } catch (error) {
        console.error(error);
    }
}

// add-task-btn
document.querySelector('.add-task-btn').addEventListener('click', () => {
    const title = document.querySelector('#addTaskInput').value;
    if (title) {
        addTask(title);
        document.querySelector('#addTaskInput').value = ''; 
        alert('Enter task title');
    }
});

// remove-task-btn
document.querySelector('.remove-task-btn').addEventListener('click', () => {
    const selectedTask = document.querySelector('.list-items .selected')
    if (selectedTask) {
        const taskId = selectedTask.dataset.taskId;
        removeTask(taskId);
        document.querySelector('.list-items .selected').value = ''; 
    } else {
        alert('Select task to delete');
    }
});


document.querySelector('.list-items').addEventListener('click', event => {
    const clickedTask = event.target;
    // Uncheck all other tasks[]
    document.querySelectorAll('.list-items li').forEach(task => {
        task.classList.remove('selected');
    });
    // Add a selection to the task you clicked
    clickedTask.classList.toggle('selected');
});