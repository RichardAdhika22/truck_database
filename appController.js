const express = require('express');
const appService = require('./appService');
const routeService = require('./appService-route');
const orderService = require('./appService-order');
const locationService = require('./appService-location');

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

// =======================
// ROUTE TABLE
// =======================

router.post("/initiate-routeTable", async (req, res) => {
    const initiateResult = await routeService.initiateRouteTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-routeTable", async (req, res) => {
    const { routeId, origin, destination, distance } = req.body;
    const insertResult = await routeService.insertRouteTable(routeId, origin, destination, distance);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/delete-routeTable", async (req, res) => {
    const { routeId} = req.body;
    const insertResult = await routeService.deleteRouteTable(routeId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/routeTable', async (req, res) => {
    const tableContent = await routeService.fetchRouteTableFromDb();
    res.json({data: tableContent});
});

// =======================
// ORDER TABLE
// =======================

router.post("/initiate-orderTable", async (req, res) => {
    const initiateResult = await orderService.initiateOrderTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-orderTable", async (req, res) => {
    const { orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime } = req.body;
    const insertResult = await orderService.insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/orderTable', async (req, res) => {
    const tableContent = await orderService.fetchOrderTableFromDb();
    res.json({data: tableContent});
});

router.post("/update-orderTable", async (req, res) => {
    const { orderId, attribute, newValue } = req.body;
    const updateResult = await orderService.updateOrderTable(orderId, attribute, newValue);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// =======================
// LOCATION TABLE
// =======================

router.post("/initiate-locationTable", async (req, res) => {
    const initiateResult = await locationService.initiateLocationTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/locationTable', async (req, res) => {
    const tableContent = await locationService.fetchLocationTableFromDb();
    res.json({data: tableContent});
});

module.exports = router;