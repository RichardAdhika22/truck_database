// =======================
// LOCATION TABLE
// =======================

import { populateTable} from './scripts.js';

async function resetLocationTable() {
    try {
        const response = await fetch("/initiate-locationTable", {
            method: 'POST'
        });
        const responseData = await response.json();
        if (!responseData.success) {
            throw new Error("Error initiating location table!");
        }
    } catch(err) {
        throw new Error("Error initiating location table!");
    }
}

async function fetchAndDisplayLocationTable() {
    const tableElement = document.getElementById('locationTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/locationTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const content = responseData.data;
    populateTable(tableBody, content);
}

export {resetLocationTable, fetchAndDisplayLocationTable};