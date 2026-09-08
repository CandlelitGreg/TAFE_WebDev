
const form = document.getElementById("AddTaskToList");
const taskDetailsContainer = document.getElementById("taskDetailsContainer");
const displayedConsultants = document.getElementById("taskConsultant");
const searchBar = document.getElementById("searchInput");
const consultantSearchBar = document.getElementById("consultantSearchInput");
let consultantListOG = [];
let consultantListSplit = [];



//List of tasks and their information
const taskList = [];


/*The TaskStatus array tracks whether the task has been marked as complete
This ensures that if a task has been marked as complete it remains that way even when the list is updated or refreshed. */
const taskStatus = [];


class Task {
    constructor(name, dueDate, priority, consultant) {
        this.name = name;
        this.dueDate = dueDate;
        this.priority = priority;
        this.consultant = consultant;
    }
}

/* Reads employee list file and seperates into 3 arrays:
 - an array formatted the same as in the text file
 - an array of arrays with the role being the primary value
 - an array of arrays with the employee name being the primary value
 */
async function readFile() {
  try {
    // Provide the path to your file and the encoding
    const data = await fetch('./roles.txt');
    const text = await data.text();
    consultantListOG = text.split(",\r\n");
    for (let i = 0; i < consultantListOG.length; i++)
    {
        consultantListSplit.push(consultantListOG[i].split("|"));
    }
  } catch (err) {
    console.error('Error reading file:', err);
  }
}
readFile();


/* Listener func tracks text in consultant search and uses current input to return matched results */
consultantSearchBar.addEventListener('input', (event) => {
    if (event.target.value.trim() != null && event.target.value.trim() != '' && typeof(event.target.value.trim()) === "string") {
        SearchConsultant(event.target.value.trim().toString());
    }
})

/* Listener func tracks whether there is text in the search bar to determine whether 
the search button should function as a search or a revert to display all tasks */
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


//Displays all tasks by default, or only requested tasks
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
    //Writes row contents with task details
    for (let i = 0; i < tasks.length; i++)
    {
        
        /* The if statement below checks whether this index of the taskList has been 
        marked as completed so the display and buttons can be altered respectively */
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
    //If there are no tasks, the default table is displayed
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
//Automatically displays existing tasks at page launch
DisplayTasks(taskList, taskStatus);

//Adds task to taskList array and displays existing tasks
function AddTaskToList(name, dueDate, priority, consultant)
{
    taskList.push(new Task(name, dueDate, priority, consultant));
    taskStatus.push(false);
    DisplayTasks(taskList, taskStatus);
}

//Takes task information from form and calls AddTaskToList with new task details
function GetTask()
{
    //Checks if consultant field is left empty/default and inputs default no consultant text accordingly
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

function SearchConsultant(input)
{
    //call sequential search for each employee list
    if (input.split("|").length > 1)
    {
        let searchFullResults = GetSearchResults(input, consultantListOG);
        //TODO: Still need to format these return values for display
        DisplayConsultantOptions(searchFullResults.split("|"));
        return
    }
    
    let searchRoleResults = GetSearchResults(input, consultantListSplit, 0);
    let searchEmployeeResults = GetSearchResults(input, consultantListSplit, 1);
    for (let i = 0; i < searchEmployeeResults.length; i++)
    {
        if (!BinarySearch(searchEmployeeResults[i][0], searchRoleResults))
        {
            searchRoleResults.push(searchEmployeeResults[i]);
        }
    }
    DisplayConsultantOptions(searchRoleResults);
}

function DisplayConsultantOptions(possibleConsultants)
{
    let formattedList = [];
    let html = `<option value="default">Select Consultant</option>`;
    //If the employee selected is not a typical consultant append note to their name in task details
    for (let i = 0; i < possibleConsultants.length; i++)
    {
        if (textInString("consultant", possibleConsultants[i][0]))
        {
            formattedList.push(`${possibleConsultants[i][1]} - ${possibleConsultants[i][0]}`);
            html += `\n<option value="${formattedList[i]}">${formattedList[i]}</option>`;
        }
        else 
        {
            formattedList.push(`${possibleConsultants[i][1]} - ${possibleConsultants[i][0]} (NOT TYPICALLY A CONSULTANT)`);
            html += `\n<option value="${formattedList[i]}">${possibleConsultants[i][1]} - ${possibleConsultants[i][0]}</option>`;
        }
    }
    if (formattedList.length < 1) {
        html = `<option value="default">No Employees Match Your Search</option>`;
    }
    displayedConsultants.innerHTML = html;
}


function BinarySearch(input, list)
{
    let lowIndex = 0;
    let highIndex = list.length - 1;
    while (lowIndex <= highIndex)
    {
        let midIndex = Math.floor(lowIndex + (highIndex - lowIndex) / 2);
        if (list[midIndex][0] == input)
        {
            return true;
        }
        else if (list[midIndex][0] < input)
        {
            lowIndex = midIndex + 1;
        }        
        else
        {
            highIndex = midIndex - 1;
        }
    }
    return false;
}


//When the button is pressed it finds the parent row, and alters its table data, including the button's display
/*Initially this was a checkbox but imbedding the listening function into the innerHTML with each row creation 
became too difficult, so a button that could simultaneously be used for the delete purpose was born */
/*Similarly, changing the onSubmit function was also proving finicky, so a simpler use of the taskStatus array was implimented*/
function CompleteTask(element, index) {
    //If it is marked as completed, undergo deletion functionality
    if (taskStatus[index])
    {
        taskList.splice(index, 1);
        taskStatus.splice(index, 1);
        DisplayTasks(taskList, taskStatus);
        return false;
    }
    //Find each tr td and alter them to add the strikethrough class (this will cross out their text)
    for (let i = 0; i < element.parentElement.parentElement.children.length - 1; i++)
    {
        element.parentElement.parentElement.children[i].classList.toggle("strikethrough");
    }
    element.children[0].value = "Delete Task";
    taskStatus[index] = true;
    return false;
}

//Calls for tasks matching search to be displayed and alters search button to display all tasks
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

//Searches through tasks for any names matching the search text (not case sensitive)
function DisplaySearchResults(search) {
    let searchTasks = [];
    let searchStatus = [];

    //Splits string on search text to check whether it is present
    for (let i = 0; i < taskList.length; i++)
    {
        if (textInString(taskList[i].name, search))
        {
            searchTasks.push(taskList[i]);
            searchStatus.push(taskStatus[i]);
        }
    }

    //If there are no tasks matching search results show default result
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


//Function that searches a term in a list and returns matching values
function GetSearchResults(input, searchList, indexSearch)
{
    let positiveResults = [];
    for (let i = 0; i < searchList.length; i++)
    {
        if (textInString(searchList[i][indexSearch], input))
        {
            positiveResults.push(searchList[i]);
        }
    }
    return positiveResults;
}

//Function that searches a term in a list and returns matching values
function GetSearchResults(input, searchList)
{
    let positiveResults = [];
    for (let i = 0; i < searchList.length; i++)
    {
        if (textInString(input, searchList[i]))
        {
            positiveResults.push(searchList[i]);
        }
    }
    return positiveResults;
}

//Function searches if a text value is found in a string and returns a bool
function textInString(text, string)
{
    let result = false;
    let splitString = string.toString().toLowerCase().split(text.toLowerCase());
    if (splitString.length > 1)
    {
        result = true;
    }
    return result;
}