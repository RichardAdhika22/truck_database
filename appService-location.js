// =======================
// LOCATION TABLE
// =======================

const appService = require('./appService');

async function initiateLocationTable() {
    return await appService.withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE ROUTETTABLE`);
        } catch(err) {
            console.log('Route table does not exist!');
        }

        try {
            await connection.execute(`DROP TABLE LOCATIONTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const orderTableResult = await connection.execute(`
            CREATE TABLE LOCATIONTABLE (
                coordinate VARCHAR2(30) PRIMARY KEY,
                city CHAR(6),
                address VARCHAR2(40) NOT NULL,
                capacity NUMBER,
                trucksParked NUMBER,
                closeTime CHAR(5),
                openTime CHAR(5)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchLocationTableFromDb() {
    return await appService.withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM LOCATIONTABLE`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    initiateLocationTable,
    fetchLocationTableFromDb,
};