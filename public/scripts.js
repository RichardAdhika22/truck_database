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

import {resetRouteTable, fetchAndDisplayRouteTable, insertRouteTable, deleteRouteTable} from './scripts-route.js';
import {resetOrderTable, fetchAndDisplayOrderTable, insertOrderTable, updateOrderTable, handleUpdateOptions} from './scripts-order.js';
import {resetLocationTable, fetchAndDisplayLocationTable} from './script-location.js';

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
    fetchAndDisplayLocationTable();
}

async function resetTable() {
    const messageElement = document.getElementById('resetResultMsg');
    try {
        await resetRouteTable();
        await resetOrderTable();    
        await resetLocationTable();  
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

function hideShow(sectionId) {
    const section = document.getElementById(sectionId);
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
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

    document.getElementById("resetDemotable").addEventListener("click", resetTable);
    document.getElementById("insertRouteTable").addEventListener("submit", insertRouteTable);
    document.getElementById("deleteRouteTable").addEventListener("submit", deleteRouteTable);

    document.getElementById("insertOrderTable").addEventListener("submit", insertOrderTable);
    document.getElementById("updateOrderTable").addEventListener("submit", updateOrderTable);
};

export {
    fetchTableData, 
    populateTable,
};
