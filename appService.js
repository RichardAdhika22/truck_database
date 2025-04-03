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

// QUERY 1: Insert
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

// QUERY 3: Delete
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

// QUERY 6: Join (Find orders using route with distance at least the given input)
async function joinRouteTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        // console.log(selectQuery);
        const result = await connection.execute(
            `SELECT o.orderId, o.customerId, o.weight, o.routeId, TO_CHAR(o.orderDate, 'YYYY-MM-DD'), l1.address, l2.address, r.distance
            FROM ORDERTABLE o, ROUTETABLE r, LOCATIONTABLE l1, LOCATIONTABLE l2
            WHERE o.routeId = r.routeId AND r.origin = l1.coordinate AND r.destination = l2.coordinate AND r.distance >= ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 10: Division (Find all routes that are used by all order dates.)
async function findRouteDateRouteTable() {
    return await withOracleDB(async (connection) => {
        // console.log(selectQuery);
        const result = await connection.execute(
            `SELECT r.routeId
            FROM ROUTETABLE r
            WHERE NOT EXISTS (
                SELECT o1.orderDate FROM ORDERTABLE o1 
                MINUS (
                    SELECT o2.orderDate FROM ORDERTABLE o2
                    WHERE r.routeId=o2.routeId
                )
            )`
        );
        return result.rows;
    }).catch(() => {
        return [];
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

async function insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceId, employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime, invoiceId, dispatcherId) 
            VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, 'YYYY-MM-DD'), :departureTime, :arrivalTime, :invoiceId, :dispatcherId)`,
            [orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime, invoiceId, employeeId],
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
            `SELECT orderId, customerId, weight, routeId, TO_CHAR(orderDate, 'YYYY-MM-DD'), departureTime, arrivalTime, invoiceId, dispatcherId FROM ORDERTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 2: Update
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

// QUERY 4: Select
async function selectOrderTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT orderId, customerId, weight, routeId, TO_CHAR(orderDate, 'YYYY-MM-DD'), departureTime, arrivalTime FROM ORDERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 5: Projection
async function projectOrderTable(projectQuery) {
    return await withOracleDB(async (connection) => {
        if (projectQuery.includes("orderDate")) {
            projectQuery = projectQuery.replace(/\borderDate\b/g, "TO_CHAR(orderDate, 'YYYY-MM-DD')");
        }
        
        console.log(projectQuery);
        const result = await connection.execute(
            `SELECT DISTINCT ${projectQuery} FROM ORDERTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 7: Group By (count the number of orders for each customer, sorted from highest to lowest)
async function countCustomerOrderTable() {
    return await withOracleDB(async (connection) => {
        // console.log(selectQuery);
        const result = await connection.execute(
            `SELECT customerId, COUNT(*) AS orderCount
            FROM ORDERTABLE
            GROUP BY customerId
            ORDER BY orderCount DESC`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 8: Having (find the earliest departure time of dates that have at least 2 orders)
async function findDateOrderTable() {
    return await withOracleDB(async (connection) => {
        // console.log(selectQuery);
        const result = await connection.execute(
            `SELECT TO_CHAR(orderDate, 'YYYY-MM-DD'), MIN(departureTime)
            FROM ORDERTABLE
            GROUP BY orderDate
            HAVING COUNT(*) > 1`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// QUERY 9: Nested Group By (find the order which has weight greater than or equal to the average weight of order for each day)
async function findWeightOrderTable() {
    return await withOracleDB(async (connection) => {
        // console.log(selectQuery);
        const result = await connection.execute(
            `SELECT o.orderId, o.weight
            FROM ORDERTABLE o
            WHERE o.weight >= ALL (SELECT AVG(o2.weight) FROM ORDERTABLE o2 GROUP BY o2.orderDate)`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteOrderTable(orderId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM ORDERTABLE 
            WHERE orderId=:orderId`,
            [orderId],
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

async function insertInvoiceTable(invoiceId, issueDate, status, orderId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO INVOICETABLE (invoiceId, issueDate, status, orderId) 
            VALUES (:invoiceId, TO_DATE(:issueDate, 'YYYY-MM-DD'), :status, :orderId)`,
            [invoiceId, issueDate, status, orderId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateInvoiceTable(invoiceId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        if (attribute === "issueDate") {
            result = await connection.execute(
                `UPDATE INVOICETABLE SET ${attribute}=TO_DATE(:newValue, 'YYYY-MM-DD') WHERE invoiceId=:invoiceId`,
                [newValue, invoiceId],
                { autoCommit: true }
            );
        } else {
            result = await connection.execute(
                `UPDATE INVOICETABLE SET ${attribute}=:newValue WHERE invoiceId=:invoiceId`,
                [newValue, invoiceId],
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
            `SELECT invoiceId, TO_CHAR(issueDate, 'YYYY-MM-DD'), status FROM INVOICETABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}


async function deleteInvoiceTable(invoiceId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM INVOICETABLE 
            WHERE invoiceId=:invoiceId`,
            [invoiceId],
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

async function insertCustomerTable(customerId, phoneNumber, email, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO CUSTOMERTABLE (customerId, phoneNumber, email, name) 
            VALUES (:customerId, :phoneNumber, :email, :name)`,
            [customerId, phoneNumber, email, name],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateCustomerTable(customerId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE CUSTOMERTABLE SET ${attribute}=:newValue WHERE customerId=:customerId`,
            [newValue, customerId],
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
            `SELECT customerId, phoneNumber, email, name FROM CUSTOMERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteCustomerTable(customerId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM CUSTOMERTABLE 
            WHERE customerId=:customerId`,
            [customerId],
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

async function insertEmployeeTable(employeeId, sin, phoneNumber, email, workLocation) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO EMPLOYEETABLE (employeeId, sin, phoneNumber, email, workLocation) 
            VALUES (:employeeId, :sin, :phoneNumber, :email, :workLocation)`,
            [employeeId, sin, phoneNumber, email, workLocation],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateEmployeeTable(employeeId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE EMPLOYEETABLE SET ${attribute}=:newValue WHERE employeeId=:employeeId`,
            [newValue, employeeId],
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
            `SELECT employeeId, sin, phoneNumber, email, workLocation FROM EMPLOYEETABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteEmployeeTable(employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM EMPLOYEETABLE 
            WHERE employeeId=:employeeId`,
            [employeeId],
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

async function insertDispatcherTable(employeeId, dispatcherId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DISPATCHERTABLE (employeeId, dispatcherId) 
            VALUES (:employeeId, :dispatcherId)`,
            [employeeId, dispatcherId],
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
            `SELECT employeeId, dispatcherId FROM DISPATCHERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDispatcherTable(employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DISPATCHERTABLE 
            WHERE employeeId=:employeeId`,
            [employeeId],
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

async function insertDriverTable(employeeId, licenseId, hoursDriven) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DRIVERTABLE (employeeId, licenseId, hoursDriven) 
            VALUES (:employeeId, :licenseId, :hoursDriven)`,
            [employeeId, licenseId, hoursDriven],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateDriverTable(employeeId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE DRIVERTABLE SET ${attribute}=:newValue WHERE employeeId=:employeeId`,
            [newValue, employeeId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

async function selectDriverTable(selectQuery) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT employeeId, licenseId, hoursDriven FROM DRIVERTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDriverTable(employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DRIVERTABLE 
            WHERE employeeId=:employeeId`,
            [employeeId],
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

async function insertDriverDrivesTable(plateNumber, employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DRIVERDRIVESTABLE (plateNumber, employeeId) 
            VALUES (:plateNumber, :employeeId)`,
            [plateNumber, employeeId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateDriverDrivesTable(plateNumber, employeeId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE DRIVERDRIVESTABLE SET ${attribute}=:newValue WHERE plateNumber=:plateNumber AND employeeId=:employeeId`,
            [newValue, plateNumber, employeeId],
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
            `SELECT plateNumber, employeeId FROM DRIVERDRIVESTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteDriverDrivesTable(plateNumber, employeeId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM DRIVERDRIVESTABLE 
            WHERE plateNumber=:plateNumber AND employeeId=:employeeId`,
            [plateNumber, employeeId],
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

async function insertAssignedTable(plateNumber, employeeId, orderId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ASSIGNEDTABLE (plateNumber, employeeId, orderId) 
            VALUES (:plateNumber, :employeeId, :orderId)`,
            [plateNumber, employeeId, orderId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function updateAssignedTable(orderId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        result = await connection.execute(
            `UPDATE ASSIGNEDTABLE SET ${attribute}=:newValue WHERE orderId=:orderId`,
            [newValue, orderId],
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
            `SELECT plateNumber, employeeId, orderId FROM ASSIGNEDTABLE WHERE ${selectQuery}`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function deleteAssignedTable(orderId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM ASSIGNEDTABLE 
            WHERE orderId=:orderId`,
            [orderId],
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
    joinRouteTable,
    findRouteDateRouteTable,
    insertOrderTable,
    fetchOrderTableFromDb,
    updateOrderTable,
    selectOrderTable,
    projectOrderTable,
    countCustomerOrderTable,
    findDateOrderTable,
    findWeightOrderTable,
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
    insertDriverTable,
    updateDriverTable,
    selectDriverTable,
    deleteDriverTable,
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
    insertLocationTable,
    selectLocationTable,
    updateLocationTable,
    deleteLocationTable,
};