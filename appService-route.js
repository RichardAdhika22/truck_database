// =======================
// ROUTE TABLE
// =======================

const appService = require('./appService');

async function initiateRouteTable() {
    return await appService.withOracleDB(async (connection) => {
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
    return await appService.withOracleDB(async (connection) => {
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
    return await appService.withOracleDB(async (connection) => {
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
    return await appService.withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM ROUTETABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}


module.exports = {
    insertRouteTable,
    fetchRouteTableFromDb,
    initiateRouteTable,
    deleteRouteTable,
};