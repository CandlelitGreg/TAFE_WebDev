
const form = document.getElementById("AddTaskToList");
const taskDetailsContainer = document.getElementById("taskDetailsContainer");
const searchBar = document.getElementById("searchInput");
const taskList = [];
const taskStatus = [];

class Task {
    constructor(name, dueDate, priority, consultant) {
        this.name = name;
        this.dueDate = dueDate;
        this.priority = priority;
        this.consultant = consultant;
    }
}

searchBar.addEventListener('input', (event) => {
    if (event.target.value.trim() === '') {
        searchBar.parentElement.children[1].value = "Show All Tasks";
        searchBar.parentElement.onsubmit = function() {
            DisplayTasks();
            return false;
        }
    } else {
        searchBar.parentElement.children[1].value = "Search Task";
        searchBar.parentElement.onsubmit = function() {
            SearchForTask(this)
            return false;
        }
    }
})

function DisplayTasks(tasks = taskList, completed = taskStatus)
{
    let table = document.getElementById("taskTable");
    let htmlTemplate = `<thead>
                <tr>
                    <th>Task Name</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Consultant</th>
                    <th>Complete</th>
                </tr>
            </thead>
            <tbody>`;
    let html = htmlTemplate;
    for (let i = 0; i < tasks.length; i++)
    {
        if (completed[i])
        {
            html += `<tr id="tableRow${i}">
            <td id="task${i}Name" class="strikethrough">${tasks[i].name}</td>
            <td id="task${i}DueDate" class="strikethrough">${tasks[i].dueDate}</td>
            <td id="task${i}Priority" class="strikethrough">${tasks[i].priority}</td>`;
            if (tasks[i].consultant != null) {
                html += `<td id="task${i}Consultant" class="strikethrough">${tasks[i].consultant}</td>`;
            } else {
                html += `<td id="task${i}Consultant" class="strikethrough">No Attached Consultant</td>`;
            }
            html += `<td><form id="completeTask${i}" onsubmit="return DeleteTask(${i})">
                <input class="taskEditButton" type="submit" value="Delete Task">
                </form>
                </td>
            </tr>`;
        } 
        else 
        {
            html += `<tr id="tableRow${i}">
            <td id="task${i}Name">${tasks[i].name}</td>
            <td id="task${i}DueDate">${tasks[i].dueDate}</td>
            <td id="task${i}Priority">${tasks[i].priority}</td>`;
            if (tasks[i].consultant != null) {
                html += `<td id="task${i}Consultant">${tasks[i].consultant}</td>`;
            } else {
                html += `<td id="task${i}Consultant">No Attached Consultant</td>`;
            }
            html += `<td><form id="completeTask${i}" onsubmit="return CompleteTask(this, ${i})">
                <input class="taskEditButton" type="submit" value="Complete Task">
                </form>
                </td>
            </tr>`;
        }
        
        
    }
    html += `</tbody>`
    table.innerHTML = html === `${htmlTemplate}</tbody>` ?
        `<thead>
                <tr>
                    <th>Task Name</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Consultant</th>
                    <th>Complete</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>INPUT NAME</td>
                    <td>INPUT DATE</td>
                    <td>INPUT PRIORITY</td>
                    <td>INPUT CONSULTANT</td>
                    <td><input type="checkbox" name="completed"></td>
                </tr>
            </tbody>` : html;
}
DisplayTasks(taskList, taskStatus);


function AddTaskToList(name, dueDate, priority, consultant)
{
    taskList.push(new Task(name, dueDate, priority, consultant));
    taskStatus.push(false);
    DisplayTasks(taskList, taskStatus);
}

function GetTask()
{
    let consultant = document.getElementById("taskConsultant").value.trim();
    if (consultant == null || consultant == "default")
    {
        AddTaskToList(document.getElementById("taskName").value.trim(), document.getElementById("taskDueDate").value.trim(), document.getElementById("taskPriority").value.trim(), "No Attached Consultant");
    } else {
        AddTaskToList(document.getElementById("taskName").value.trim(), document.getElementById("taskDueDate").value.trim(), document.getElementById("taskPriority").value.trim(), consultant);
    }
    form.reset();
    DisplayTasks(taskList, taskStatus);
    return false;
}

function CompleteTask(element, index) {
    if (taskStatus[index])
    {
        taskList.splice(index, 1);
        taskStatus.splice(index, 1);
        DisplayTasks(taskList, taskStatus);
        return false;
    }
    for (let i = 0; i < element.parentElement.parentElement.children.length - 1; i++)
    {
        element.parentElement.parentElement.children[i].classList.toggle("strikethrough");
    }
    element.children[0].value = "Delete Task";
    taskStatus[index] = true;
    return false;
}

function SearchForTask(element){
    DisplaySearchResults(document.getElementById("searchInput").value.trim());
    searchBar.parentElement.children[1].value = "Show All Tasks";
    searchBar.parentElement.onsubmit = function() {
        DisplayTasks();
        return false;
    }
    element.reset();
    return false;
}

function DisplaySearchResults(search) {
    let searchTasks = [];
    let searchStatus = [];
    for (let i = 0; i < taskList.length; i++)
    {
        let nameSplit = taskList[i].name.toLowerCase().split(search.toLowerCase());
        if (nameSplit.length > 1)
        {
            searchTasks.push(taskList[i]);
            searchStatus.push(taskStatus[i]);
        }
    }
    if (searchTasks.length < 1)
    {
        let table = document.getElementById("taskTable");
        let html = `<thead>
                <tr>
                    <th>No Tasks Match Your Search</th>
                </tr>
            </thead>`;
        table.innerHTML = html === `` ?
        `<thead>
            <tr>
                <th>No Tasks Match Your Search</th>
            </tr>
        </thead>` : html;
    }
    else
    {
        DisplayTasks(searchTasks, searchStatus);
    }
}