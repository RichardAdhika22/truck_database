// =======================
// ORDER TABLE
// =======================

const appService = require('./appService');

async function initiateOrderTable() {
    return await appService.withOracleDB(async (connection) => {
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
            VALUES ('o00002', 'c00002', 100, 'r00001', TO_DATE('2025-03-29', 'YYYY-MM-DD'), '16:00', NULL)`,
            [],
            { autoCommit: true }
        );

        await connection.execute(
            `INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
            VALUES ('o00003', 'c00001', 300, 'r00001', TO_DATE('2025-04-01', 'YYYY-MM-DD'), '10:00', '22:00')`,
            [],
            { autoCommit: true }
        );
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertOrderTable(orderId, customerId, weight, routeId, orderDate, departureTime, arrivalTime) {
    return await appService.withOracleDB(async (connection) => {
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
    return await appService.withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT orderId, customerId, weight, routeId, TO_CHAR(orderDate, 'YYYY-MM-DD'), departureTime, arrivalTime FROM ORDERTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function updateOrderTable(orderId, attribute, newValue) {
    return await appService.withOracleDB(async (connection) => {
        let result;

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
    initiateOrderTable,
    insertOrderTable,
    fetchOrderTableFromDb,
    updateOrderTable,
};
