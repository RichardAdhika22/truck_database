const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

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

// =======================
// ROUTE TABLE
// =======================

async function initiateRouteTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE ORDERTABLE`);
        } catch(err) {
            console.log('Order table does not exist yet!');
        }
        try {
            await connection.execute(`DROP TABLE ROUTETABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const routeTableResult = await connection.execute(`
            CREATE TABLE ROUTETABLE (
                routeId CHAR(6) PRIMARY KEY,
                origin VARCHAR2(30) NOT NULL,
                destination VARCHAR2(30) NOT NULL,
                distance NUMBER
            )
        `);

        await connection.execute(`
            INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
            VALUES ('r00001', '49.25761407, -123.23615578', '49.27048682, -123.15760743', 10)`, 
            [],
            { autoCommit: true }
        );

        await connection.execute(`
            INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
            VALUES ('r00002', '49.22764848, -123.06627330', '49.13373432, -122.83702854', 35)`, 
            [],
            { autoCommit: true }
        );

        await connection.execute(`
            INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
            VALUES ('r00003', '43.69039231, -79.28855125', '43.65886249, -79.48819193', 22)`, 
            [],
            { autoCommit: true }
        );
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertRouteTable(routeId, origin, destination, distance) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ROUTETABLE (routeId, origin, destination, distance) VALUES (:routeId,:origin, :destination, :distance)`,
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

async function initiateOrderTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE ORDERTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const orderTableResult = await connection.execute(`
            CREATE TABLE ORDERTABLE (
                orderId CHAR(6) PRIMARY KEY,
                customerId CHAR(6) NOT NULL,
                weight NUMBER,
                routeId CHAR(6) NOT NULL,
                orderDate DATE,
                departureTime CHAR(5),
                arrivalTime CHAR(5),
                FOREIGN KEY (routeId) REFERENCES ROUTETABLE
                    ON DELETE CASCADE
            )
        `);

        await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
            VALUES ('o00001', 'c00001', 150, 'r00002', TO_DATE('2025-04-22', 'YYYY-MM-DD'), '06:00', '12:22')`,
            [],
            { autoCommit: true }
        );

        await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
            VALUES ('o00002', 'c00002', 150, 'r00001', TO_DATE('2025-03-29', 'YYYY-MM-DD'), '16:00', NULL)`,
            [],
            { autoCommit: true }
        );

        await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
            VALUES ('o00003', 'c00001', 150, 'r00001', TO_DATE('2025-04-01', 'YYYY-MM-DD'), '10:00', '22:00')`,
            [],
            { autoCommit: true }
        );
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime) 
            VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, 'YYYY-MM-DD'), :departureTime, :arrivalTime)`,
            [orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime],
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
            `SELECT orderId, customerId, weight, routeId, TO_CHAR(orderDate, 'YYYY-MM-DD'), departureTime, arrivalTime FROM ORDERTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function updateOrderTable(orderId, attribute, newValue) {
    return await withOracleDB(async (connection) => {
        let result;
        console.log(attribute);

        if (attribute === "orderDate") {
            result = await connection.execute(
                `UPDATE ORDERTABLE SET ${attribute}=TO_DATE(:newValue, 'YYYY-MM-DD') where orderId=:orderId`,
                [newValue, orderId],
                { autoCommit: true }
            );
        } else {
            result = await connection.execute(
                `UPDATE ORDERTABLE SET ${attribute}=:newValue where orderId=:orderId`,
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

module.exports = {
    testOracleConnection,
    insertRouteTable,
    fetchRouteTableFromDb,
    initiateRouteTable,
    initiateOrderTable,
    insertOrderTable,
    fetchOrderTableFromDb,
    updateOrderTable,
    deleteRouteTable,
};