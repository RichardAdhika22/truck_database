BEGIN
-- This part of code is to delete all existing tables 
-- taken from https://stackoverflow.com/questions/1690404/how-to-drop-all-user-tables/1690419#1690419
    FOR cur_rec IN (SELECT object_name, object_type
                    FROM user_objects
                    WHERE object_type IN
                                ('TABLE',
                                'VIEW',
                                'MATERIALIZED VIEW',
                                'PACKAGE',
                                'PROCEDURE',
                                'FUNCTION',
                                'SEQUENCE',
                                'SYNONYM',
                                'PACKAGE BODY'
                                ))
    LOOP
        BEGIN
            IF cur_rec.object_type = 'TABLE'
            THEN
            EXECUTE IMMEDIATE 'DROP '
                                || cur_rec.object_type
                                || ' "'
                                || cur_rec.object_name
                                || '" CASCADE CONSTRAINTS';
            ELSE
            EXECUTE IMMEDIATE 'DROP '
                                || cur_rec.object_type
                                || ' "'
                                || cur_rec.object_name
                                || '"';
            END IF;
        EXCEPTION
            WHEN OTHERS
            THEN
            DBMS_OUTPUT.put_line ('FAILED: DROP '
                                    || cur_rec.object_type
                                    || ' "'
                                    || cur_rec.object_name
                                    || '"'
                                    );
        END;
    END LOOP;
    FOR cur_rec IN (SELECT * 
                    FROM all_synonyms 
                    WHERE table_owner IN (SELECT USER FROM dual))
    LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP PUBLIC SYNONYM ' || cur_rec.synonym_name;
        END;
    END LOOP;

    EXECUTE IMMEDIATE 'CREATE TABLE ROUTETABLE (
        routeId CHAR(6) PRIMARY KEY,
        origin VARCHAR2(30) NOT NULL,
        destination VARCHAR2(30) NOT NULL,
        distance NUMBER
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE ORDERTABLE (
        orderId CHAR(6) PRIMARY KEY,
        customerId CHAR(6) NOT NULL,
        weight NUMBER,
        routeId CHAR(6) NOT NULL,
        orderDate DATE,
        departureTime CHAR(8),
        arrivalTime CHAR(8),
        FOREIGN KEY (routeId) REFERENCES ROUTETABLE
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE LOCATIONTABLE (
        coordinate VARCHAR2(30) PRIMARY KEY,
        city VARCHAR2(20),
        address VARCHAR2(40) NOT NULL,
        capacity NUMBER,
        trucksParked NUMBER,
        closeTime CHAR(5),
        openTime CHAR(5)
    )';

    EXECUTE IMMEDIATE 'INSERT INTO ROUTETABLE (routeId, origin, destination, distance) 
                       VALUES (:routeId, :origin, :destination, :distance)' 
    USING 'r00001', '49.25761407, -123.23615578', '49.27048682, -123.15760743', 10;

    EXECUTE IMMEDIATE 'INSERT INTO ROUTETABLE (routeId, origin, destination, distance) 
                       VALUES (:routeId, :origin, :destination, :distance)' 
    USING 'r00002', '49.22764848, -123.06627330', '49.13373432, -122.83702854', 35;

    EXECUTE IMMEDIATE 'INSERT INTO ROUTETABLE (routeId, origin, destination, distance) 
                       VALUES (:routeId, :origin, :destination, :distance)' 
    USING 'r00003', '43.69039231, -79.28855125', '43.65886249, -79.48819193', 22;

    EXECUTE IMMEDIATE 'INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime) 
                        VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, ''YYYY-MM-DD''), :departureTime, :arrivaltime)' 
    USING 'o00001', 'c00001', 100, 'r00002', '2025-04-22', '06:00', '02:22';

    EXECUTE IMMEDIATE 'INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime) 
                        VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, ''YYYY-MM-DD''), :departureTime, :arrivaltime)' 
    USING 'o00002', 'c00002', 150, 'r00001', '2025-03-29', '16:00', '23:45';

    EXECUTE IMMEDIATE 'INSERT INTO ORDERTABLE (orderId, customerId, weight, routeId, orderDate, departureTime, arrivaltime) 
                        VALUES (:orderId, :customerId, :weight, :routeId, TO_DATE(:orderDate, ''YYYY-MM-DD''), :departureTime, :arrivaltime)' 
    USING 'o00003', 'c00001', 300, 'r00001', '2025-04-01', '10:00', '22:00';

END;