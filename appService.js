const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const fs = require('fs').promises;

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function executeSqlFile() {
    const sqlContent = await fs.readFile('./initializeTables.sql', 'utf8');
    // const sqlStatements = sqlContent.split('/').filter(stmt => stmt.trim().length > 0);

    return await withOracleDB(async (connection) => {
        // for (let statement of sqlStatements) {
        //     await connection.execute(statement);
        // }
        await connection.execute(sqlContent);
        await connection.commit();

        return true;
    }).catch(() => {
        return false;
    });
}   

// =======================
// ROUTE TABLE
// =======================

async function insertRouteTable(routeId, origin, destination, distance) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ROUTETABLE (routeId, origin, destination, distance) VALUES (:routeId, :origin, :destination, :distance)`,
            [routeId, origin, destination, distance],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}  

async function deleteRouteTable(routeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM ROUTETABLE 
            WHERE routeId=:routeId`,
            [routeId],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}  

async function fetchRouteTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM ROUTETABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// =======================
// ORDER TABLE
// =======================

async function insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceID, employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime, invoiceID, employeeID) 
            VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, 'YYYY-MM-DD'), :departureTime, :arrivalTime, :invoiceID, :employeeID)`,
            [orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceID, employeeID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}   

async function fetchOrderTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime FROM ORDERTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function updateOrderTable(orderId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        if (attribute === "orderDate") {
            result = await connection.execute(
                `UPDATE ORDERTABLE SET ${attribute}=TO_DATE(:newValue, 'YYYY-MM-DD') WHERE orderId=:orderId`,
                [newValue, orderId],
                { autoCommit: true }
            );
        } else {
            result = await connection.execute(
                `UPDATE ORDERTABLE SET ${attribute}=:newValue WHERE orderId=:orderId`,
                [newValue, orderId],
                { autoCommit: true }
            );
        }
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectOrderTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime FROM ORDERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteOrderTable(orderID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM ORDERTABLE 
            WHERE orderID=:orderID`,
            [orderID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =======================
// INVOICE TABLE
// =======================

async function insertInvoiceTable(invoiceID, issueDate, status, orderID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO INVOICETABLE (invoiceID, issueDate, status, orderID) 
            VALUES (:invoiceID, TO_DATE(:issueDate, 'YYYY-MM-DD'), :status, :orderID)`,
            [invoiceID, issueDate, status, orderID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateInvoiceTable(invoiceID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        if (attribute === "issueDate") {
            result = await connection.execute(
                `UPDATE INVOICETABLE SET ${attribute}=TO_DATE(:newValue, 'YYYY-MM-DD') WHERE invoiceID=:invoiceID`,
                [newValue, invoiceID],
                { autoCommit: true }
            );
        } else {
            result = await connection.execute(
                `UPDATE INVOICETABLE SET ${attribute}=:newValue WHERE invoiceID=:invoiceID`,
                [newValue, invoiceID],
                { autoCommit: true }
            );
        }
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectInvoiceTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT invoiceID, issueDate, status, orderID FROM INVOICETABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}


async function deleteInvoiceTable(invoiceID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM INVOICETABLE 
            WHERE invoiceID=:invoiceID`,
            [invoiceID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ======================
// CUSTOMER TABLE
// ======================

async function insertCustomerTable(customerID, phoneNumber, email, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO CUSTOMERTABLE (customerID, phoneNumber, email, name) 
            VALUES (:customerID, :phoneNumber, :email, :name)`,
            [customerID, phoneNumber, email, name],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateCustomerTable(customerID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE CUSTOMERTABLE SET ${attribute}=:newValue WHERE customerID=:customerID`,
            [newValue, customerID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectCustomerTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT invoiceID, issueDate, status, orderID FROM CUSTOMERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteCustomerTable(customerID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM CUSTOMERTABLE 
            WHERE customerID=:customerID`,
            [customerID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =======================
// EMPLOYEE TABLE
// =======================

async function insertEmployeeTable(employeeID, sin, phoneNumber, email, workLocation) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO EMPLOYEETABLE (employeeID, sin, phoneNumber, email, workLocation) 
            VALUES (:employeeID, :sin, :phoneNumber, :email, :workLocation)`,
            [employeeID, sin, phoneNumber, email, workLocation],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateEmployeeTable(employeeID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE EMPLOYEETABLE SET ${attribute}=:newValue WHERE employeeID=:employeeID`,
            [newValue, employeeID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectEmployeeTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT employeeID, sin, phoneNumber, email, workLocation FROM EMPLOYEETABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteEmployeeTable(employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM EMPLOYEETABLE 
            WHERE employeeID=:employeeID`,
            [employeeID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}
// ================
// DISPATCHER TABLE
// ================

async function insertDispatcherTable(employeeID, dispatcherID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DISPATCHERTABLE (employeeID, dispatcherID) 
            VALUES (:employeeID, :dispatcherID)`,
            [employeeID, dispatcherID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function selectDispatcherTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT employeeID, dispatcherID FROM DISPATCHERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDispatcherTable(employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DISPATCHERTABLE 
            WHERE employeeID=:employeeID`,
            [employeeID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ================
// DRIVER TABLE
// ================

async function insertDriversTable(employeeID, licenseID, hoursDriven) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DRIVERTABLE (employeeID, licenseID, hoursDriven) 
            VALUES (:employeeID, :licenseID, :hoursDriven)`,
            [employeeID, licenseID, hoursDriven],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateDriversTable(employeeID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE DRIVERSTABLE SET ${attribute}=:newValue WHERE employeeID=:employeeID`,
            [newValue, employeeID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectDriversTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT employeeID, licenseID, hoursDriven FROM DRIVERSTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDriversTable(employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DRIVERSTABLE 
            WHERE employeeID=:employeeID`,
            [employeeID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =========================
// TRUCK TABLE
// =========================

async function insertTruckTable(plateNumber, model, mileage, status, parkedAt) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO TRUCKTABLE (plateNumber, model, mileage, status, parkedAt) 
            VALUES (:plateNumber, :model, :mileage, :status, :parkedAt)`,
            [plateNumber, model, mileage, status, parkedAt],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateTruckTable(plateNumber, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE TRUCKTABLE SET ${attribute}=:newValue WHERE plateNumber=:plateNumber`,
            [newValue, plateNumber],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectTruckTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT plateNumber, model, mileage, status, parkedAt FROM TRUCKTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteTruckTable(plateNumber) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM TRUCKTABLE 
            WHERE plateNumber=:plateNumber`,
            [plateNumber],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =========================
// DRIVERDRIVES TABLE
// =========================

async function insertDriverDrivesTable(plateNumber, employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DRIVERDRIVESTABLE (plateNumber, employeeID) 
            VALUES (:plateNumber, :employeeID)`,
            [plateNumber, employeeID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateDriverDrivesTable(plateNumber, employeeID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE DRIVERDRIVESTABLE SET ${attribute}=:newValue WHERE plateNumber=:plateNumber AND employeeID=:employeeID`,
            [newValue, plateNumber, employeeID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectDriverDrivesTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT plateNumber, employeeID FROM DRIVERDRIVESTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDriverDrivesTable(plateNumber, employeeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DRIVERDRIVESTABLE 
            WHERE plateNumber=:plateNumber AND employeeID=:employeeID`,
            [plateNumber, employeeID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =========================
// ASSIGNED TABLE
// =========================

async function insertAssignedTable(plateNumber, employeeID, orderID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ASSIGNEDTABLE (plateNumber, employeeID, orderID) 
            VALUES (:plateNumber, :employeeID, :orderID)`,
            [plateNumber, employeeID, orderID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateAssignedTable(orderID, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE ASSIGNEDTABLE SET ${attribute}=:newValue WHERE orderID=:orderID`,
            [newValue, orderID],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectAssignedTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT plateNumber, employeeID, orderID FROM ASSIGNEDTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteAssignedTable(orderID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM ASSIGNEDTABLE 
            WHERE orderID=:orderID`,
            [orderID],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// =======================
// LOCATION TABLE
// =======================

async function insertLocationTable(coordinate, city, address, capacity, trucksParked, closeTime, openTime) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO LOCATIONTABLE (coordinate, city, address, capacity, trucksParked, closeTime, openTime)
             VALUES (:coordinate, :city, :address, :capacity, :trucksParked, :closeTime, :openTime)`,
            [coordinate, city, address, capacity, trucksParked, closeTime, openTime],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateLocationTable(coordinate, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE LOCATIONTABLE SET ${attribute}=:newValue WHERE coordinate=:coordinate`,
            [newValue, coordinate],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectLocationTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT coordinate, city, address, capacity, trucksParked, closeTime, openTime FROM LOCATIONTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteLocationTable(coordinate) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM LOCATIONTABLE 
            WHERE coordinate=:coordinate`,
            [coordinate],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}



module.exports = {
    executeSqlFile,
    testOracleConnection,
    insertRouteTable,
    fetchRouteTableFromDb,
    deleteRouteTable,
    insertOrderTable,
    fetchOrderTableFromDb,
    updateOrderTable,
    selectOrderTable,
    deleteOrderTable,
    insertInvoiceTable,
    updateInvoiceTable,
    selectInvoiceTable,
    deleteInvoiceTable,
    insertCustomerTable,
    updateCustomerTable,
    selectCustomerTable,
    deleteCustomerTable,
    insertEmployeeTable,
    updateEmployeeTable,
    selectEmployeeTable,
    deleteEmployeeTable,
    insertDispatcherTable,
    selectDispatcherTable,
    deleteDispatcherTable,
    insertDriversTable,
    updateDriversTable,
    selectDriversTable,
    deleteDriversTable,
    insertTruckTable,
    updateTruckTable,
    selectTruckTable,
    deleteTruckTable,
    insertDriverDrivesTable,
    updateDriverDrivesTable,
    selectDriverDrivesTable,
    deleteDriverDrivesTable,
    insertAssignedTable,
    updateAssignedTable,
    selectAssignedTable,
    deleteAssignedTable,
};