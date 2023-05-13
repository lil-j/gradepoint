// Initialize variables
let alreadyListening = false;
let lastCourseCodes = [];

// Main function to add column to table [For main course search]
function addColumnToTable() {
    // Get the table element
    const table = document.querySelector(".table.table-striped.table-borderless");
    // If table is not found, retry after 500ms
    if (!table) {
        setTimeout(addColumnToTable, 500);
        return;
    }

    const courseCodes = getCourseCodes(table);

    // Compare current course codes with last course codes
    if (JSON.stringify(lastCourseCodes) !== JSON.stringify(courseCodes)) {
        lastCourseCodes = courseCodes;
        trulyAddColumn(table);
    } else {
        // Check if AVG. GPA column exists
        const headerRow = table.querySelector("thead tr");
        const headerCells = headerRow.querySelectorAll("th");
        let avgGpaColumnExists = false;

        // Iterate through header cells to find AVG. GPA column
        for (const headerCell of headerCells) {
            if (headerCell.innerText === "AVG. GPA") {
                avgGpaColumnExists = true;
            }
        }

        // If AVG. GPA column does not exist, add the column
        if (!avgGpaColumnExists) {
            trulyAddColumn(table);
        }
    }

    // Repeat the function every 1000ms
    setTimeout(addColumnToTable, 1000);
}


// Function to add AVG. GPA column to the table
async function trulyAddColumn(table) {
    // Add new header column for AVG. GPA
    const headerRow = table.querySelector("thead tr");
    const newHeader = document.createElement("th");
    newHeader.innerText = "AVG. GPA";
    newHeader.setAttribute("scope", "col");
    headerRow.appendChild(newHeader);

    // Add new data column for AVG. GPA to each row
    const rows = table.querySelectorAll("tbody tr");
    const courseInfo = []
    for (const row of rows) {
        const courseCodeElement = row.querySelector("th a");
        const courseCode = courseCodeElement.textContent;
        const numSections = row.querySelector('th small').textContent.split(' ')[0]; // Extract number of sections
        courseInfo.push({
            courseCode: courseCode,
            sectionCount: numSections
        })
    }
    const gpas = await getGPAS(courseInfo);
    for (const row of rows) {
        const courseCodeElement = row.querySelector("th a");
        const courseCode = courseCodeElement.textContent;
        const newCell = document.createElement("td");

        newCell.innerText = gpas[courseCode] ? gpas[courseCode] : "N/A";

        if (gpas[courseCode]) {
            newCell.style.backgroundColor = getGradientColor(gpas[courseCode]);
            newCell.className = "show-gpa"
        }

        row.appendChild(newCell);
    }
}

const letters = [
    "A", "B", "C", "D", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

async function getGPAS(courseInfo) {
    let finalCourseNames = [];
    for (const course of courseInfo) {
        for (let i = 0; i < course.sectionCount; i++) {
            if (i + 1 >= letters.length) {
                break;
            }
            const courseName = `${course.courseCode} ${letters[i]}`;
            finalCourseNames.push(courseName);
        }
    }
    const gpa = await fetch(`https://bhpscfcsjsqqqtovmwfk.functions.supabase.co/get-gpas-for-courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            courseNumbers: finalCourseNames.filter(onlyUnique)
        })
    });
    const {data: gpaJson} = await gpa.json();

    // Calculate AVG GPAS
    const avgGPAS = calculateAverageGPA(gpaJson)

    return avgGPAS;
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

// Function to get course codes from the table
function getCourseCodes(table) {
    const courseCodes = [];
    const rows = table.querySelectorAll("tbody tr");

    // Iterate through rows and extract course codes
    for (const row of rows) {
        const courseCodeElement = row.querySelector("th a");
        const courseCode = courseCodeElement.textContent;
        courseCodes.push(courseCode);
    }

    return courseCodes;
}

function calculateAverageGPA(data) {
    // Create an object to store the sum of GPAs and count for each course
    const courseGPAData = {};

    // Iterate through each data item in the input data
    data.forEach(item => {
        // Extract the course number without the letter at the end
        const courseNumber = item.Course_Number.replace(/\s+[A-Za-z]$/, '');

        // If the course number is not already in courseGPAData, add it with the initial values
        if (!courseGPAData[courseNumber]) {
            courseGPAData[courseNumber] = {
                gpaSum: 0,
                count: 0,
            };
        }

        // Add the current item's GPA to the course's cumulative GPA sum and increment the count
        courseGPAData[courseNumber].gpaSum += item.Average_GPA;
        courseGPAData[courseNumber].count += 1;
    });

    // Calculate the average GPA for each course and store it in a new object
    const averageGPAs = {};
    for (const courseNumber in courseGPAData) {
        averageGPAs[courseNumber] = Math.round((courseGPAData[courseNumber].gpaSum / courseGPAData[courseNumber].count) * 100) / 100;
    }

    // Return the object containing the average GPAs for each course
    return averageGPAs;
}

// Call the main function for course search results overview page
addColumnToTable();

// Call the main function for specific course pages and professor info
addColumnToTableProffesor();

function addColumnToTableProffesor() {
    // Get the table
    const tables = document.querySelectorAll("table");
    let header = null;
    try {
        header = document.evaluate("//*[@id=\"course-search-results-panel\"]/div/div/div/div[3]/div[1]/div[1]/h3", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (e) {
        // do nothing
    }
    // Check if table exists
    if (tables.length == 0 || header !== null) {
        // Repeat the function every 1000ms
        setTimeout(addColumnToTableProffesor, 1000);
        return;
    }

    // Get Course Name
    header = document.evaluate("//*[@id=\"main-content\"]/div[1]/h1", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const courseName = (header.childNodes[0].nodeValue.replace(/\s+/g, " "));
    // Table exists
    // Add the column to the table
    tables.forEach(table => {
        // Check if AVG. GPA column exists
        const headerRow = table.querySelector("thead tr");
        const headerCells = headerRow.querySelectorAll("th");
        let avgGpaColumnExists = false;

        // Iterate through header cells to find Instructor GPA column
        for (const headerCell of headerCells) {
            if (headerCell.innerText === "Instructor GPA") {
                avgGpaColumnExists = true;
            }
        }

        // If AVG. GPA column does not exist, add the column
        if (!avgGpaColumnExists) {
            addColumnToTableProffesorHelper(table);
            // Get Instructor name, if possible
            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                cells.forEach(cell => {
                    const innerDiv = cell.children[0]
                    if (innerDiv) {
                        const classname = innerDiv.className
                        if (classname === "mb-1") {
                            const newCell = document.createElement("td");
                            fetchGPAForInstructorAndCourse(innerDiv.innerText, courseName).then((gpa) => {
                                newCell.innerText = gpa
                                if (!isNaN(gpa)) {
                                    newCell.style.backgroundColor = getGradientColor(gpa);
                                    newCell.className = "show-gpa"
                                }
                                row.appendChild(newCell);

                            })
                        }
                    }
                })

            })
        }
    })

    // Repeat the function every 1000ms
    setTimeout(addColumnToTableProffesor, 1000);
}

function addColumnToTableProffesorHelper(table) {
    // Add new header column for AVG. GPA
    const headerRow = table.querySelector("thead tr");
    const newHeader = document.createElement("th");
    newHeader.innerText = "Instructor GPA";
    newHeader.setAttribute("scope", "col");
    headerRow.appendChild(newHeader);
}

async function fetchGPAForInstructorAndCourse(instructor, course) {
    const data =  await fetch("https://bhpscfcsjsqqqtovmwfk.functions.supabase.co/gpa-by-course-and-prof", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            courseNumber: course,
            primaryInstructor: instructor
        })
    })
    const gpaJson = await data.json();

    return gpaJson.data.length > 0 ? calculateAverageGPA(gpaJson.data)[course.toUpperCase()] : "N/A";

}

/**
 * Get the color corresponding to the input number on a dynamic gradient scale.
 *
 * @param {number} num - The input number (between 1 and 4).
 * @return {string} The corresponding gradient color.
 */
function getGradientColor(num) {
    // Check if the input is within the valid range
    if (num < 1 || num > 4) {
        throw new Error('Invalid input: number should be between 1 and 4.');
    }

    // Calculate the color components based on the input number
    const red = Math.round(255 * (4 - num) / 3);
    const green = Math.round(255 * (num - 1) / 3);
    const blue = 0;

    // Convert the color components to a hex string
    const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    // Return the gradient color
    return rgbToHex(red, green, blue);
}

// console.log('content script running');

const style = document.createElement('style');
style.innerHTML = `
  .rating {
    margin-top: 7px;
  }
`;
document.head.appendChild(style);

function appendRMP() {
    let professorLinks;
    const profInterval = setInterval(() => {
        professorLinks = document.querySelectorAll('div.mb-1');
        if (professorLinks.length > 0) {
            clearInterval(profInterval);
            // console.log('Prof names found:', professorLinks);
            professorLinks.forEach(async (link) => {
                const professorName = link.textContent;
                try {
                    const port = chrome.runtime.connect({ name: 'professor-rating' });
                    port.postMessage({ professorName });
                    port.onMessage.addListener((teacher) => {
                        // console.log('Received response for professor:', teacher);
                        if (teacher.error) {
                            console.error('Error:', teacher.error);
                            insertNoProfError(link, professorName);
                        } else {
                            const avgRating = teacher.avgRating;
                            const numRatings = teacher.numRatings;
                            const avgDifficulty = teacher.avgDifficulty;
                            const wouldTakeAgainPercent = parseInt(teacher.wouldTakeAgainPercent);
                            const legacyId = teacher.legacyId;

                            if (wouldTakeAgainPercent === -1) {
                                console.error('Error: No ratings found for professor.');
                                insertNoRatingsError(link, legacyId);
                                return;
                            }

                            insertNumRatings(link, numRatings, legacyId);
                            insertWouldTakeAgainPercent(link, wouldTakeAgainPercent);
                            insertAvgDifficulty(link, avgDifficulty);
                            insertRating(link, avgRating);
                        }
                    });
                } catch (error) {
                    console.error('Error:', error);
                    insertNoProfError(link, professorName);
                }
            });
        } else {
            // console.log('Retrying every 1500ms until prof names are found...');
        }
    }, 1500);
}

// call appendRMP() when the page is loaded
appendRMP();

// call the function when the URL hash changes
window.addEventListener('hashchange', appendRMP, false);

function insertRating(link, avgRating) {
    link.insertAdjacentHTML('afterend', `<div class="rating"><b>Rating:</b> ${avgRating}/5</div>`);
}

function insertAvgDifficulty(link, avgDifficulty) {
    link.insertAdjacentHTML('afterend', `<div class="rating"><b>Difficulty:</b> ${avgDifficulty}/5</div>`);
}

function insertWouldTakeAgainPercent(link, wouldTakeAgainPercent) {
    link.insertAdjacentHTML('afterend', `<div class="rating"><b>${wouldTakeAgainPercent}%</b> of students would take this professor again.</div>`);
}

function insertNumRatings(link, numRatings, legacyId) {
    const profLink = `<a target="_blank" rel="noopener noreferrer" href='https://www.ratemyprofessors.com/professor?tid=${legacyId}'>${numRatings} ratings</a>`;
    link.insertAdjacentHTML('afterend', `<div class="rating">${profLink}</div>`);
}

function insertNoRatingsError(link, legacyId) {
    link.insertAdjacentHTML(
        'afterend',
        `<div class="rating"><b>Error:</b> this professor has <a target="_blank" rel="noopener noreferrer" href='https://www.ratemyprofessors.com/search/teachers?query=${legacyId}'>no ratings on RateMyProfessors.</a></div>`
    );
}

function insertNoProfError(link, professorName) {
    link.insertAdjacentHTML(
        'afterend',
        `<div class="rating"><b>Professor not found: </b><a target="_blank" rel="noopener noreferrer" href='https://www.ratemyprofessors.com/search/teachers?query=${encodeURIComponent(
            professorName
        )}'>Click to Search RMP</a></div>`
    );
}
