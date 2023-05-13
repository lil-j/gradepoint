let alreadyListening = false;

function addColumnToTable() {
    const table = document.querySelector(".table.table-striped.table-borderless");
    if (!table) {
        console.log("Table not found, looking again.")
        setTimeout(addColumnToTable, 500); // Retry after 500ms if table not found
        return;
    } else {
        console.log("Table found!");
    }
    trulyAddColumn(table);

    // Define the button's XPath
    const buttonXPath = "/html/body/div/div[2]/div/div/div[2]/main/form/div[1]/div[2]/div[2]/div/div[1]/button";

    // Get the button element using its XPath
    const buttonElement = getElementByXPath(buttonXPath);
    // Check if the button exists
    if (buttonElement && !alreadyListening) {
        // Add a click event listener to the button
        buttonElement.addEventListener("click", function (event) {
            alreadyListening = true;
            console.log("Button clicked!");
            setTimeout(addColumnToTable, 500);
            // Your logic here
        });
    }
}

function trulyAddColumn(table) {
    // Add new header column
    const headerRow = table.querySelector("thead tr");
    const newHeader = document.createElement("th");
    newHeader.innerText = "AVG. GPA";
    newHeader.setAttribute("scope", "col");
    headerRow.appendChild(newHeader);

    // Add new data column to each row
    const rows = table.querySelectorAll("tbody tr");
    for (const row of rows) {
        const courseCodeElement = row.querySelector("th a");
        const courseCode = courseCodeElement.textContent;

        // Execute a function for each course code
        handleCourseCode(courseCode);

        const newCell = document.createElement("td");
        newCell.innerText = courseCode;
        row.appendChild(newCell);
    }
}

function handleCourseCode(courseCode) {
    // Add your custom script that will run for each course code
    // console.log("Course code:", courseCode);
}

// Function to get an element by XPath
function getElementByXPath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

addColumnToTable();