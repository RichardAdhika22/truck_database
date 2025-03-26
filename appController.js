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

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

// =========================================================================
// SAMPLE CODE ENDS HERE !
// ========================================================================

// =======================
// ROUTE TABLE
// =======================

router.post("/initiate-routeTable", async (req, res) => {
    const initiateResult = await appService.initiateRouteTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

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
    const insertResult = await appService.deleteRouteTable(routeId);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/routeTable', async (req, res) => {
    const tableContent = await appService.fetchRouteTableFromDb();
    res.json({data: tableContent});
});

// =======================
// ORDER TABLE
// =======================

router.post("/initiate-orderTable", async (req, res) => {
    const initiateResult = await appService.initiateOrderTable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-orderTable", async (req, res) => {
    const { orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime } = req.body;
    const insertResult = await appService.insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/orderTable', async (req, res) => {
    const tableContent = await appService.fetchOrderTableFromDb();
    res.json({data: tableContent});
});

router.post("/update-customerId-orderTable", async (req, res) => {
    const { oldCustomerId, newCustomerId } = req.body;
    const updateResult = await appService.updateCustomerIdOrderTable(oldCustomerId, newCustomerId);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

module.exports = router;