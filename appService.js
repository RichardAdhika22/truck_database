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

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

// =============================================================================
// SAMPLE CODE ENDS HERE !
// =====================================================================

// =======================
// ROUTE TABLE
// =======================

async function initiateRouteTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE ROUTETABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const routeTableResult = await connection.execute(`
            CREATE TABLE ROUTETABLE (
                origin VARCHAR2(30),
                destination VARCHAR2(30),
                distance NUMBER,
                PRIMARY KEY (origin, destination)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertRouteTable(origin, destination, distance) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ROUTETABLE (origin, destination, distance) VALUES (:origin, :destination, :distance)`,
            [origin, destination, distance],
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
                orderID CHAR(8) PRIMARY KEY,
                customerID CHAR(8),
                weight NUMBER,
                orderDate DATE,
                departureTime CHAR(8),
                arrivalTime CHAR(8)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertOrderTable(orderID, customerID, weight, orderDate, departureTime, arrivalTime) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO ORDERTABLE (orderID, customerID, weight, orderDate, departureTime, arrivaltime) 
            VALUES (:orderID, :customerID, :weight, TO_DATE(:orderDate, 'YYYY-MM-DD'), :departureTime, :arrivalTime)`,
            [orderID, customerID, weight, orderDate, departureTime, arrivalTime],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}   

async function fetchOrderTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM ORDERTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    insertRouteTable,
    fetchRouteTableFromDb,
    initiateRouteTable,
    initiateOrderTable,
    insertOrderTable,
    fetchOrderTableFromDb,
};