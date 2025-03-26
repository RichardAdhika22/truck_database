// =======================
// ORDER TABLE
// =======================

import {fetchTableData, populateTable} from './scripts.js';

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

export {
    resetOrderTable,
    fetchAndDisplayOrderTable,
    insertOrderTable,
    updateOrderTable,
    handleUpdateOptions,
};