const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.post("/initiate-tables", async (req, res) => {
    const initiateResult = await appService.executeSqlFile();

    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// =======================
// ROUTE TABLE
// =======================

router.post("/insert-routeTable", async (req, res) => {
    const { routeId, origin, destination, distance } = req.body;
    const insertResult = await appService.insertRouteTable(routeId, origin, destination, distance);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-routeTable", async (req, res) => {
    const { routeId} = req.body;
    const deleteResult = await appService.deleteRouteTable(routeId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/join-routeTable', async (req, res) => {
    const { selectQuery } = req.query;  
    if (!selectQuery) {
        return res.status(400).json({ error: "selectQuery parameter is required" });
    }

    try {
        const selectResult = await appService.joinRouteTable(selectQuery);
        res.json({ data: selectResult });
    } catch (error) {
        res.status(500).json({ error: "Error executing the query", message: error.message });
    }
});

router.get('/routeTable', async (req, res) => {
    const tableContent = await appService.fetchRouteTableFromDb();
    res.json({data: tableContent});
});

// =======================
// ORDER TABLE
// =======================

router.get('/orderTable', async (req, res) => {
    const tableContent = await appService.fetchOrderTableFromDb();
    res.json({data: tableContent});
});

router.post("/insert-orderTable", async (req, res) => {
    const { orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceId, dispatcherId } = req.body;
    const insertResult = await appService.insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceId, dispatcherId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-orderTable", async (req, res) => {
    const { orderId, attribute, newValue } = req.body;
    const updateResult = await appService.updateOrderTable(orderId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-orderTable', async (req, res) => {
    const { selectQuery } = req.query;  
    console.log(selectQuery);
    if (!selectQuery) {
        return res.status(400).json({ error: "selectQuery parameter is required" });
    }

    try {
        const selectResult = await appService.selectOrderTable(selectQuery);
        res.json({ data: selectResult });
    } catch (error) {
        res.status(500).json({ error: "Error executing the query", message: error.message });
    }
});

router.get('/project-orderTable', async (req, res) => {
    const { projectQuery } = req.query;  

    try {
        const projectResult = await appService.projectOrderTable(projectQuery);
        res.json({ data: projectResult });
    } catch (error) {
        res.status(500).json({ error: "Error executing the query", message: error.message });
    }
});

router.delete("/delete-orderTable", async (req, res) => {
    const { orderId } = req.body;
    const deleteResult = await appService.deleteOrderTable(orderId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


// =======================
// LOCATION TABLE
// =======================

// get all
router.get('/locationTable', async (req, res) => {
    const tableContent = await appService.selectLocationTable("1=1");
    res.json({data: tableContent});
});

router.post("/insert-locationTable", async (req, res) => {
    const { coordinate, city, address, capacity, trucksParked, closeTime, openTime } = req.body;
    const insertResult = await appService.insertLocationTable(coordinate, city, address, capacity, trucksParked, closeTime, openTime);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-locationTable", async (req, res) => {
    const { coordinate } = req.body;
    const deleteResult = await appService.deleteLocationTable(coordinate);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// INVOICE TABLE
// ----------------------------------------------------------
router.get('/invoiceTable', async (req, res) => {
    const result = await appService.selectInvoiceTable("1=1");
    res.json({ data: result });
});

router.post('/insert-invoiceTable', async (req, res) => {
    const { invoiceId, issueDate, status, orderId } = req.body;
    const insertResult = await appService.insertInvoiceTable(invoiceId, issueDate, status, orderId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-invoiceTable', async (req, res) => {
    const { invoiceId, attribute, newValue } = req.body;
    const updateResult = await appService.updateInvoiceTable(invoiceId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-invoiceTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery parameter" });
    }
    try {
        const queryResult = await appService.selectInvoiceTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query execution error", message: error.message });
    }
});

router.delete('/delete-invoiceTable', async (req, res) => {
    const { invoiceId } = req.body;
    const deleteResult = await appService.deleteInvoiceTable(invoiceId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// CUSTOMER TABLE
// ----------------------------------------------------------
router.get('/customerTable', async (req, res) => {
    const result = await appService.selectCustomerTable("1=1");
    res.json({ data: result });
});

router.post('/insert-customerTable', async (req, res) => {
    const { customerId, phoneNumber, email, name } = req.body;
    const insertResult = await appService.insertCustomerTable(customerId, phoneNumber, email, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-customerTable', async (req, res) => {
    const { customerId, attribute, newValue } = req.body;
    const updateResult = await appService.updateCustomerTable(customerId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-customerTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery parameter" });
    }
    try {
        const queryResult = await appService.selectCustomerTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-customerTable', async (req, res) => {
    const { customerId } = req.body;
    const deleteResult = await appService.deleteCustomerTable(customerId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// EMPLOYEE TABLE
// ----------------------------------------------------------
router.get('/employeeTable', async (req, res) => {
    const result = await appService.selectEmployeeTable("1=1");
    res.json({ data: result });
});

router.post('/insert-employeeTable', async (req, res) => {
    const { employeeId, sin, phoneNumber, email, workLocation } = req.body;
    const insertResult = await appService.insertEmployeeTable(
        employeeId,
        sin,
        phoneNumber,
        email,
        workLocation
    );
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-employeeTable', async (req, res) => {
    const { employeeId, attribute, newValue } = req.body;
    const updateResult = await appService.updateEmployeeTable(employeeId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-employeeTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "selectQuery is required" });
    }
    try {
        const queryResult = await appService.selectEmployeeTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-employeeTable', async (req, res) => {
    const { employeeId } = req.body;
    const deleteResult = await appService.deleteEmployeeTable(employeeId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// DISPATCHER TABLE
// ----------------------------------------------------------
router.get('/dispatcherTable', async (req, res) => {
    const result = await appService.selectDispatcherTable("1=1");
    res.json({ data: result });
});

router.post('/insert-dispatcherTable', async (req, res) => {
    const { employeeId, dispatcherId } = req.body;
    const insertResult = await appService.insertDispatcherTable(employeeId, dispatcherId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-dispatcherTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery param" });
    }
    try {
        const queryResult = await appService.selectDispatcherTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-dispatcherTable', async (req, res) => {
    const { employeeId } = req.body;
    const deleteResult = await appService.deleteDispatcherTable(employeeId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// DRIVERS TABLE
// ----------------------------------------------------------
router.get('/driversTable', async (req, res) => {
    const result = await appService.selectDriversTable("1=1");
    res.json({ data: result });
});

router.post('/insert-driversTable', async (req, res) => {
    const { employeeId, licenseId, hoursDriven } = req.body;
    const insertResult = await appService.insertDriversTable(employeeId, licenseId, hoursDriven);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-driversTable', async (req, res) => {
    const { employeeId, attribute, newValue } = req.body;
    const updateResult = await appService.updateDriversTable(employeeId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-driversTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery param" });
    }
    try {
        const queryResult = await appService.selectDriversTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-driversTable', async (req, res) => {
    const { employeeId } = req.body;
    const deleteResult = await appService.deleteDriversTable(employeeId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// TRUCK TABLE
// ----------------------------------------------------------
router.get('/truckTable', async (req, res) => {
    const result = await appService.selectTruckTable("1=1");
    res.json({ data: result });
});

router.post('/insert-truckTable', async (req, res) => {
    const { plateNumber, model, mileage, status, parkedAt } = req.body;
    const insertResult = await appService.insertTruckTable(
        plateNumber,
        model,
        mileage,
        status,
        parkedAt
    );
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-truckTable', async (req, res) => {
    const { plateNumber, attribute, newValue } = req.body;
    const updateResult = await appService.updateTruckTable(plateNumber, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-truckTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery param" });
    }
    try {
        const queryResult = await appService.selectTruckTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-truckTable', async (req, res) => {
    const { plateNumber } = req.body;
    const deleteResult = await appService.deleteTruckTable(plateNumber);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// 11) DRIVERDRIVES TABLE
// ----------------------------------------------------------
router.get('/driverDrivesTable', async (req, res) => {
    const result = await appService.selectDriverDrivesTable("1=1");
    res.json({ data: result });
});

router.post('/insert-driverDrivesTable', async (req, res) => {
    const { plateNumber, employeeId } = req.body;
    const insertResult = await appService.insertDriverDrivesTable(plateNumber, employeeId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-driverDrivesTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery param" });
    }
    try {
        const queryResult = await appService.selectDriverDrivesTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-driverDrivesTable', async (req, res) => {
    const { plateNumber, employeeId } = req.body;
    const deleteResult = await appService.deleteDriverDrivesTable(plateNumber, employeeId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// ASSIGNED TABLE
// ----------------------------------------------------------
router.get('/assignedTable', async (req, res) => {
    const result = await appService.selectAssignedTable("1=1");
    res.json({ data: result });
});

router.post('/insert-assignedTable', async (req, res) => {
    const { plateNumber, employeeId, orderId } = req.body;
    const insertResult = await appService.insertAssignedTable(plateNumber, employeeId, orderId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/update-assignedTable', async (req, res) => {
    const { orderId, attribute, newValue } = req.body;
    const updateResult = await appService.updateAssignedTable(orderId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/select-assignedTable', async (req, res) => {
    const { selectQuery } = req.query;
    if (!selectQuery) {
        return res.status(400).json({ error: "Missing selectQuery param" });
    }
    try {
        const queryResult = await appService.selectAssignedTable(selectQuery);
        res.json({ data: queryResult });
    } catch (error) {
        res.status(500).json({ error: "Query error", message: error.message });
    }
});

router.delete('/delete-assignedTable', async (req, res) => {
    const { orderId } = req.body;
    const deleteResult = await appService.deleteAssignedTable(orderId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


module.exports = router;