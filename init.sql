DROP TABLE ORDERTABLE
DROP TABLE ROUTETABLE

CREATE TABLE ROUTETABLE (
    routeId CHAR(6) PRIMARY KEY,
    origin VARCHAR2(20) NOT NULL,
    destination VARCHAR2(20) NOT NULL,
    distance NUMBER
)

CREATE TABLE ORDERTABLE (
    orderId CHAR(6) PRIMARY KEY,
    customerId CHAR(6) NOT NULL,
    weight NUMBER,
    routeId CHAR(6) NOT NULL,
    orderDate DATE,
    departureTime CHAR(8),
    arrivalTime CHAR(8),
    FOREIGN KEY (routeId) REFERENCES ROUTETABLE
        ON DELETE CASCADE
)

INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
    VALUES ('r00001', '49.25761407, -123.23615578', '49.27048682, -123.15760743', 10)

INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
    VALUES ('r00002', '49.22764848, -123.06627330', '49.13373432, -122.83702854', 35)

INSERT INTO ROUTETABLE (routeId, origin, destination, distance)
    VALUES ('r00003', '43.69039231, -79.28855125', '43.65886249, -79.48819193', 22)

INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
    VALUES ('o00001', 'c00001', 100, 'r00002', TO_DATE('2025-04-22', 'YYYY-MM-DD'), '06:00', '02:22')

INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
    VALUES ('o00002', 'c00002', 150, 'r00001', TO_DATE('2025-03-29', 'YYYY-MM-DD'), '16:00', NULL)

INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime)
    VALUES ('o00003', 'c00001', 300, 'r00001', TO_DATE('2025-04-01', 'YYYY-MM-DD'), '10:00', '22:00')