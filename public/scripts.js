/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// =======================
// GENERAL FUNCTIONS
// =======================

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.

async function fetchAndDisplayTable(tableName) {
    const tableElement = document.getElementById(tableName);
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/${tableName}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const content = responseData.data;

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    content.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

function fetchTableData() {
    fetchAndDisplayTable('routeTable');
    fetchAndDisplayTable('orderTable');
    fetchAndDisplayTable('locationTable');
}

async function resetTables() {
    const messageElement = document.getElementById('resetResultMsg');
    try {
        const response = await fetch("/initiate-tables", {
            method: 'POST'
        });
        const responseData = await response.json();
        if (!responseData.success) {
            throw new Error("Error initiating tables!");
        }
        messageElement.textContent = "All tables initiated successfully!";
    } catch (err) {
        messageElement.textContent = err.message;
        alert(err.message);
    }   
}

function hideShow(sectionId) {
    const section = document.getElementById(sectionId);
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

// =======================
// ROUTE TABLE
// =======================

// Inserts new routes into the routeTable.
async function insertRouteTable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertRouteId').value;
    const originValue = document.getElementById('insertRouteOrigin').value;
    const destinationValue = document.getElementById('insertRouteDestination').value;
    const distanceValue = document.getElementById('insertRouteDistance').value;

    const response = await fetch('/insert-routeTable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            routeId: idValue,
            origin: originValue,
            destination: destinationValue,
            distance: distanceValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsgRoute');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

async function deleteRouteTable(event) {
    event.preventDefault();
    const routeIdValue = document.getElementById('insertDeleteRouteId').value;
    const response = await fetch('/delete-routeTable', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            routeId: routeIdValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteRouteIdResultMsg');

    if (responseData.success) {
        messageElement.textContent = "The specified route successfully deleted";
        fetchTableData();
    } else {
        messageElement.textContent = "The specified route does not exist!";
    }
}

// =======================
// ORDER TABLE
// =======================

// Inserts new routes into the routeTable.
async function insertOrderTable(event) {
    event.preventDefault();

    const orderIdValue = document.getElementById('insertOrderId').value;
    const customerIdValue = document.getElementById('insertOrderCustomerId').value;
    const weightValue = document.getElementById('insertOrderWeight').value;
    const routeIdValue = document.getElementById('insertOrderRouteId').value;
    const dateValue = document.getElementById('insertOrderDate').value;
    const departureTimeValue = document.getElementById('insertOrderDepartureTime').value;
    const arrivalTimeValue = document.getElementById('insertOrderArrivalTime').value;

    const response = await fetch('/insert-orderTable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId: orderIdValue,
            customerId: customerIdValue,
            weight: weightValue,
            routeId: routeIdValue,
            orderDate: dateValue,
            departureTime: departureTimeValue,
            arrivalTime: arrivalTimeValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsgOrder');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

async function updateOrderTable(event) {
    event.preventDefault();
    const orderIdValue = document.getElementById('insertUpdateOrderId').value;
    const attributeValue = document.getElementById('updateOptions').value;
    const newValue = document.getElementById('newOrderValue').value;

    const response = await fetch('/update-orderTable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId: orderIdValue,
            attribute: attributeValue,
            newValue: newValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateOrderResultMsg');

    if (responseData.success) {
        messageElement.textContent = "The specified attribute updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating the specified attribute!";
    }
}

function handleUpdateOptions() {
    const selectElement = document.getElementById("updateOptions");
    const selectedValue = selectElement.value;
    const inputContainer = document.getElementById("updateInputcontainer");

    // Clear the input container
    inputContainer.innerHTML = '';

    // Add an input box based on the selected option
    if (selectedValue === "customerId") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Customer ID: </label>
                <input type="text" id="newOrderValue" placeholder="6-characters ID" required minlength="6" maxlength="6">`;
    } else if (selectedValue === "weight") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Weight: </label>
                <input type="number" id="newOrderValue" placeholder="Enter Item Weight (in Kg)">`;
    } else if (selectedValue === "routeId") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Route ID: </label>
                <input type="text" id="newOrderValue" placeholder="6-characters ID" required minlength="6" maxlength="6">`;
    } else if (selectedValue === "orderDate") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Date :</label>
                <input type="date" id="newOrderValue">`
    } else if (selectedValue === "departureTime") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Departure Time: </label>
                <input type="time" id="newOrderValue">`
    } else if (selectedValue === "arrivalTime") {
        inputContainer.innerHTML = `<label for="newOrderValue">New Arrival Time: </label>
                <input type="time" id="newOrderValue">`
    }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById('updateOptions').addEventListener('change', handleUpdateOptions);
    document.getElementById('hideShowRoute').addEventListener('click', function() {hideShow('routePageContent');});
    document.getElementById('hideShowOrder').addEventListener('click', function() {hideShow('orderPageContent');});
    document.getElementById('hideShowLocation').addEventListener('click', function() {hideShow('locationPageContent');});

    document.getElementById("resetTables").addEventListener("click", resetTables);
    document.getElementById("insertRouteTable").addEventListener("submit", insertRouteTable);
    document.getElementById("deleteRouteTable").addEventListener("submit", deleteRouteTable);

    document.getElementById("insertOrderTable").addEventListener("submit", insertOrderTable);
    document.getElementById("updateOrderTable").addEventListener("submit", updateOrderTable);
};
