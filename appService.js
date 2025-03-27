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

// =======================
// LOCATION TABLE
// =======================

async function fetchLocationTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM LOCATIONTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}


module.exports = {
    executeSqlFile,
    testOracleConnection,
    insertRouteTable,
    fetchRouteTableFromDb,
    insertOrderTable,
    fetchOrderTableFromDb,
    updateOrderTable,
    deleteRouteTable,
    fetchLocationTableFromDb
};