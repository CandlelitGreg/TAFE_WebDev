const form = document.getElementById("AddTaskToList");
const taskDetailsContainer = document.getElementById("taskDetailsContainer");
const displayedConsultants = document.getElementById("taskConsultant");
const searchBar = document.getElementById("searchInput");
const consultantSearchBar = document.getElementById("consultantSearchInput");
let consultantListOG = [];
let consultantListSplit = [];
let darkmode = false;



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

/**
 * Reads employee list file and seperates into 2 arrays:
 - an array formatted the same as in the text file
 - an array of arrays with the roles and names being split
 *
 * @async
 * @returns {*} 
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

//Checks page url and whether a dark theme query is detected
//If so, the dark mode is toggled on
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let userTheme = urlParams.get('theme');
if (userTheme == 'dark')
{
    console.log(window.location);
    darkmode = false;
    console.log("last page had dark mode but this one does not")
    ToggleDarkMode();
}


/**
* Listener func tracks text in consultant search and uses current input to return matched results 
*
* @async
* @returns {*} 
*/
consultantSearchBar.addEventListener('input', (event) => {
    if (textInString("tasks.html", window.location.pathname) && event.target.value.trim() != null && event.target.value.trim() != '' && typeof(event.target.value.trim()) === "string") {
        SearchConsultant(event.target.value.trim().toString());
    }
})


/**
 * Listener func tracks whether there is text in the search bar to determine whether the search button should function as a search or a revert to display all tasks
 * 
 * @async
 * @returns {*}
 */
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


/**
 * Displays all tasks by default, or only requested tasks
 * @param {string[]} tasks - Array of tasks to be displayed
 * @param {bool[]} completed - Array of bools stating whether it's matching index task should be marked as complete
 */
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


/**
 * Adds task to taskList array and displays existing tasks
 * @param {string} name - Name of the new task
 * @param {string} dueDate - Due date for the new task
 * @param {string} priority - Priority of the new task
 * @param {string} consultant - Consultant/employee attached to the new task
 */
function AddTaskToList(name, dueDate, priority, consultant)
{
    taskList.push(new Task(name, dueDate, priority, consultant));
    taskStatus.push(false);
    DisplayTasks(taskList, taskStatus);
}


/**
 * Takes task information from form and calls AddTaskToList with new task details
 * @returns {bool} false to prevent POST call
 */
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

/**
 * Searches for consultants and roles which include input text - Calls DisplayConsultantOptions() with the results
 * @param {string} input - The current text in the consultant search box
 * @returns {} - returns early if detecting a role|employee seperator "|"
 */
function SearchConsultant(input)
{
    //call sequential search for each employee list
    if (input.split("|").length > 1)
    {
        let searchFullResults = [];
        let searchRoleResults = GetSearchResults(input.split("|")[0], consultantListSplit);
        let searchEmployeeResults = GetSearchResults(input.split("|")[1], consultantListSplit);
        for (let i = 0; i < searchEmployeeResults.length; i++)
        {
            if (BinarySearch(searchEmployeeResults[i][0], searchRoleResults))
            {
                searchFullResults.push(searchEmployeeResults[i]);
            }
        }
        DisplayConsultantOptions(searchFullResults);
        return
    }
    
    let searchRoleResults = GetSearchResults(input, consultantListSplit);
    let searchEmployeeResults = GetSearchResults(input, consultantListSplit);
    for (let i = 0; i < searchEmployeeResults.length; i++)
    {
        if (!BinarySearch(searchEmployeeResults[i][0], searchRoleResults))
        {
            searchRoleResults.push(searchEmployeeResults[i]);
        }
    }
    DisplayConsultantOptions(searchRoleResults);
}

/**
 * Displays all input consultants/employees in the consultant drop down selection
 * @param {string[][]} possibleConsultants - Array of Consultant/Role Arrays/Tuples
 */
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

/**
 * Runs a binary search (purpose is to search for employee seccessful matches in role matches and ensure no double ups)
 * This is only relevant for the purposes of this assessment, alterantively the role and name search would be conducted simultaneously and the data split for formatting and display purposes after results are found
 * @param {string} input - The item to search for
 * @param {string[]} list - The list/array to search in
 * @returns {bool} - The returned bool references the success/discovery of the input value in the list
 */
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


/*Initially this was a checkbox but imbedding the listening function into the innerHTML with each row creation 
became too difficult, so a button that could simultaneously be used for the delete purpose was born */
/*Similarly, changing the onSubmit function was also proving finicky, so a simpler use of the taskStatus array was implimented*/
/**
 * Finds the parent row of the caller button, and alters its table data, including the button's display
 * @param {button} element - The button from a form that is used to reference what row of data should be marked as complete
 * @param {int} index - The index of the row the button originated from
 * @returns {bool} - False is returned to prevent a POST request from the form
 */
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

/**
 * Calls for tasks matching search to be displayed and alters search button to display all tasks
 * @param {html.form} element - The element form is passed in to access its value and wipe it to prepare for a new search
 * @returns {bool} - False is returned to prevent a POST request from the form
 */
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


/**
 * Searches through tasks for any names matching the search text (not case sensitive)
 * @param {string} search - Reference string to search for in task names
 */
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



/**
 * Function that searches a term in a list and returns matching values
 * @param {string} input - String input from searchbox to search for
 * @param {string[][]} searchList - array of role/name arrays to search in
 * @returns {string[][]} - positiveResults is a returned array of role/name arrays that match the input search string
 */
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

/**
 * Function searches if a text value is found in a string and returns a bool
 * @param {string} text - Small string to search for in larger string
 * @param {string} string - Larger string as the grid for the search of the smaller string to take place in
 * @returns {bool} - Returns whether the location of the text string was found in the larger "string" string
 */
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

/**
 * This function toggles dark mode and all available links to include appropriate dark theme query
 * @returns {bool} - false return prevents POST request from reloading page
 */
function ToggleDarkMode()
{
    console.log("function entered");
    let pagePath = window.location.pathname;
    document.body.classList.toggle('darkmode');
    console.log("body edited");
    document.querySelector('header').classList.toggle('darkmode');
    document.getElementById('contactLinkWide').classList.toggle('darkmode');
    document.getElementById('tasksLinkWide').classList.toggle('darkmode');
    document.querySelector('.header-grid').classList.toggle('darkmode');
    document.getElementById('contactLinkNarrow').classList.toggle('darkmode');
    document.getElementById('tasksLinkNarrow').classList.toggle('darkmode');
    document.querySelector('.narrow-nav').classList.toggle('darkmode');
    switch (true){
        case (textInString("tasks.html", pagePath)):
            document.querySelector('input').classList.toggle('darkmode');
            document.querySelector('select').classList.toggle('darkmode');
            document.getElementById('consultantSearchInput').classList.toggle('darkmode');
            document.getElementById('taskConsultant').classList.toggle('darkmode');
            document.getElementById('taskDueDate').classList.toggle('darkmode');
            document.getElementById('searchInput').classList.toggle('darkmode');
            document.querySelector('table').classList.toggle('darkmode');
            break;
        case (textInString("home.html", pagePath)):
            break;
        case (textInString("contact.html", pagePath)):
            document.querySelector('input').classList.toggle('darkmode');
            document.getElementById("contactEmail").classList.toggle('darkmode');
            document.getElementById("contactComment").classList.toggle('darkmode');
            break;
    }
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let userTheme = urlParams.get('theme');
    try {
    if (darkmode != true)
    {
        urlParams.set('theme', 'dark');
        darkmode = true;
    } else {
        urlParams.set('theme', 'light');
        darkmode = false;
    }
} catch (error) {
    console.log("Error caught", error.message);
}
    let newPathQuery = window.location.pathname + '?' + urlParams.toString();
    window.history.pushState(null, '', newPathQuery);
    homePath = document.getElementById('homeLinkWide').href;
    homeURL = new URL(homePath);
    tasksPath = document.getElementById('tasksLinkWide').href;
    tasksURL = new URL(tasksPath);
    contactPath = document.getElementById('contactLinkWide').href;
    contactURL = new URL(contactPath);
    homeURL.searchParams.append('theme', 'dark');
    tasksURL.searchParams.append('theme', 'dark');
    contactURL.searchParams.append('theme', 'dark');
    document.getElementById('homeLinkWide').href = homeURL.toString();
    document.getElementById('homeLinkNarrow').href = homeURL.toString();
    document.getElementById('tasksLinkWide').href = tasksURL.toString();
    document.getElementById('contactLinkWide').href = contactURL.toString();
    document.getElementById('tasksLinkNarrow').href = tasksURL.toString();
    document.getElementById('contactLinkNarrow').href = contactURL.toString();
    return false;
}

/**
 * Called from a form, the form element is hidden and the message is displayed in its place
 * @param {html.form} element - HTML form element the function is called from
 * @param {string} message - string representing the message to be displayed
 * @returns {bool} - returns false to prevent POST request
 */
function DisplayConfirmation(element, message)
{
    element.style.contentVisibility = 'hidden';
    let updatedHTML = '';
    let splitMessage = message.split("\n");
    for (let i = 0; i < splitMessage.length; i++)
    {
        updatedHTML += `<p>${splitMessage[i]}</p>
                        <br>`;
    }
    element.parentElement.children[0].innerHTML = updatedHTML;
    element.parentElement.children[0].style.setProperty('min-width', '45vw')
    return false;
}