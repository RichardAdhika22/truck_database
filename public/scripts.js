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
function fetchTableData() {
    fetchAndDisplayRouteTable();
    fetchAndDisplayOrderTable();
}

async function resetTable() {
    const messageElement = document.getElementById('resetResultMsg');
    try {
        await resetRouteTable();
        await resetOrderTable();    
        fetchTableData();
        messageElement.textContent = "All tables initiated successfully!";
    } catch (err) {
        messageElement.textContent = err.message;
        alert(err.message);
    }   
}

function populateTable(tableBody, tableContent) {
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// =======================
// ROUTE TABLE
// =======================

async function resetRouteTable() {
    try {
        const response = await fetch("/initiate-routeTable", {
            method: 'POST'
        });
        const responseData = await response.json();
        if (!responseData.success) {
            throw new Error("Error initiating route table!");
        }
    } catch(err) {
        throw new Error("Error initiating route table!");
    }
}

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

async function fetchAndDisplayRouteTable() {
    const tableElement = document.getElementById('routeTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/routeTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const content = responseData.data;
    populateTable(tableBody, content);
}

async function deleteRouteTable(event) {
    event.preventDefault();
    const routeIdValue = document.getElementById('insertDeleteRouteId').value;
    // console.log(oldCustomerIdValue);
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

async function resetOrderTable() {
    try {
        const response = await fetch("/initiate-orderTable", {
            method: 'POST'
        });
        const responseData = await response.json();
        if (!responseData.success) {
            throw new Error("Error initiating order table!");
        }
    } catch(err) {
        throw new Error("Error initiating order table!");
    }
}

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
    console.log(orderIdValue);

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

async function fetchAndDisplayOrderTable() {
    const tableElement = document.getElementById('orderTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/orderTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const content = responseData.data;
    populateTable(tableBody, content);
}

async function updateCustomerIdOrderTable(event) {
    event.preventDefault();
    const oldCustomerIdValue = document.getElementById('insertOldCustomerId').value;
    const newCustomerIdValue = document.getElementById('insertNewCustomerId').value;
    // console.log(oldCustomerIdValue);
    const response = await fetch('/update-customerId-orderTable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldCustomerId: oldCustomerIdValue,
            newCustomerId: newCustomerIdValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateCustomerIdResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Customer ID updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating Customer ID!";
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetDemotable").addEventListener("click", resetTable);
    document.getElementById("insertRouteTable").addEventListener("submit", insertRouteTable);
    document.getElementById("deleteRouteTable").addEventListener("submit", deleteRouteTable);
    document.getElementById("insertOrderTable").addEventListener("submit", insertOrderTable);
    document.getElementById("updateCustomerIdOrderTable").addEventListener("submit", updateCustomerIdOrderTable);
};
