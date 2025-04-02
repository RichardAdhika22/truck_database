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
        fetchTableData();
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
    const invoiceIdValue = document.getElementById('insertOrderInvoiceId').value;
    const dispatcherIdValue = document.getElementById('insertOrderDispatcherId').value;

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
            arrivalTime: arrivalTimeValue,
            invoiceId: invoiceIdValue,
            dispatcherId: dispatcherIdValue
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

let conditionCount = 1;
function addConditionUpdate() {
    event.preventDefault();
    conditionCount++;
    const newFormGroup = document.createElement('div');
    newFormGroup.classList.add('tableDiv');

    newFormGroup.innerHTML = 
    `<select id="selectLogic${conditionCount}" name="selectLogic${conditionCount}" style="width: 100px;">
        <option value="and">AND</option>
        <option value="or">OR</option>
    </select>
    
    <div class="form-group">
        <select id="selectOptions${conditionCount}" name="selectOptions${conditionCount}">
            <option value="" disabled selected>Select an attribute</option>
            <option value="customerId">Customer ID</option>
            <option value="weight">Weight</option>
            <option value="routeId">Route ID</option>
            <option value="orderDate">Date</option>
            <option value="departureTime">Departure Time</option>
            <option value="arrivalTime">Arrival Time</option>
        </select>
    </div>

    <select id="conditionOperation${conditionCount}" name="conditionOperation${conditionCount}" style="width: 50px;">
        <option value="=">=</option>
        <option value="<"><</option>
        <option value=">">></option>
        <option value="!=">!=</option>
        <option value="<="><=</option>
        <option value=">=">>=</option>
    </select>
    
    <div id="selectInputContainer${conditionCount}" class="form-group"></div>`;

    let submitUpdate = document.getElementById('submitUpdate');
    document.getElementById('selectOrderTable').insertBefore(newFormGroup, submitUpdate);

    document.getElementById(`selectOptions${conditionCount}`).addEventListener('change', function() {handleSelectOptions(conditionCount);});
}

function handleSelectOptions(count) {
    const selectElement = document.getElementById(`selectOptions${count}`);
    const selectedValue = selectElement.value;
    const inputContainer = document.getElementById(`selectInputContainer${count}`);

    // Clear the input container
    inputContainer.innerHTML = '';

    // Add an input box based on the selected option
    if (selectedValue === "customerId") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Customer ID: </label>
                <input type="text" id="selectValue${count}" placeholder="6-characters ID" required minlength="6" maxlength="6">`;
    } else if (selectedValue === "weight") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Weight: </label>
                <input type="number" id="selectValue${count}" placeholder="Enter Item Weight (in Kg)">`;
    } else if (selectedValue === "routeId") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Route ID: </label>
                <input type="text" id="selectValue${count}" placeholder="6-characters ID" required minlength="6" maxlength="6">`;
    } else if (selectedValue === "orderDate") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Date :</label>
                <input type="date" id="selectValue${count}">`
    } else if (selectedValue === "departureTime") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Departure Time: </label>
                <input type="time" id="selectValue${count}">`
    } else if (selectedValue === "arrivalTime") {
        inputContainer.innerHTML = `<label for="selectValue${count}">New Arrival Time: </label>
                <input type="time" id="selectValue${count}">`
    }
}

function resetConditions() {
    const formContainer = document.getElementById('selectOrderTable');
    
    while (formContainer.children.length > 2) {
        formContainer.removeChild(formContainer.children[formContainer.children.length - 2]);
    }
    conditionCount = 1;
}

async function selectOrderTable() {
    event.preventDefault();
    let selectQuery = "";
    for (let i = 1; i <= conditionCount; i++) {
        const selectOptions = document.getElementById(`selectOptions${i}`).value;
        const conditionOperation = document.getElementById(`conditionOperation${i}`).value;
        const selectValue = document.getElementById(`selectValue${i}`).value;

        if (i === 1) {
            selectQuery += `${selectOptions} ${conditionOperation} ${selectValue}`;
        } else {
            const selectLogic = document.getElementById(`selectLogic${i}`).value;
            selectQuery += ` ${selectLogic} ${selectOptions} ${conditionOperation} ${selectValue}`;
        }
    }
    // console.log(selectQuery);

    const response = await fetch(`/select-orderTable?selectQuery=${encodeURIComponent(selectQuery)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const responseData = await response.json();
    // const messageElement = document.getElementById('selectOrderResultMsg');
    const content = responseData.data;

    console.log(content);
    const selectOrderTable = document.getElementById('selectOrderTable');
    if (content.length === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.textContent = 'No results found.';
        selectOrderTable.appendChild(noResultsMessage);
    } else {
        const tableResult = document.createElement('table');
        tableResult.id = 'selectOrderTableResult';
        tableResult.innerHTML = 
        `<thead>
            <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Weight</th>
                <th>Route ID</th>
                <th>Date</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
            </tr>
        </thead>
        <tbody>
        </tbody>`;
        selectOrderTable.appendChild(tableResult);

        content.forEach(user => {
            const row = tableResult.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
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
    document.getElementById("selectOptions1").addEventListener('change', function() {handleSelectOptions(1);});
    document.getElementById("addConditionUpdate").addEventListener("click", addConditionUpdate);
    document.getElementById("resetConditionUpdate").addEventListener("click", resetConditions);
    document.getElementById("selectOrderTable").addEventListener("submit", selectOrderTable);
};
