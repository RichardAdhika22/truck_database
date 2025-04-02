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

    EXECUTE IMMEDIATE 'CREATE TABLE LOCATIONTABLE (
        coordinate VARCHAR2(70) PRIMARY KEY,
        city VARCHAR2(20),
        address VARCHAR2(40) NOT NULL,
        capacity INT,
        trucksParked INT,
        closeTime CHAR(5),
        openTime CHAR(5)
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE ROUTETABLE (
        routeId CHAR(6) PRIMARY KEY,
        origin VARCHAR2(30) NOT NULL,
        destination VARCHAR2(30) NOT NULL,
        distance NUMBER,
        FOREIGN KEY (origin) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE CASCADE,
        FOREIGN KEY (destination) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE INVOICETABLE (
        invoiceId CHAR(6) PRIMARY KEY,
        issueDate DATE,
        status CHAR(1)
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMERTABLE (
        customerId CHAR(6) PRIMARY KEY,
        phoneNumber CHAR(12),
        email VARCHAR2(30),
        name VARCHAR2(25) NOT NULL
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE EMPLOYEETABLE(
        employeeId CHAR(6) PRIMARY KEY,
        sin CHAR(9) UNIQUE,
        phoneNumber CHAR(12),
        email VARCHAR2(30),
        workLocation VARCHAR2(30),
        FOREIGN KEY (workLocation) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE SET NULL
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE DISPATCHERTABLE(
        employeeId CHAR(6) PRIMARY KEY,
        dispatcherId CHAR(6) UNIQUE,
        FOREIGN KEY (employeeId) REFERENCES EMPLOYEETABLE(employeeId)
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE DRIVERTABLE(
        employeeId CHAR(6) PRIMARY KEY,
        licenceId CHAR(8) UNIQUE,
        hoursDriven NUMBER,
        FOREIGN KEY (employeeId) REFERENCES EMPLOYEETABLE(employeeId)
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE ORDERTABLE (
        orderId CHAR(6) PRIMARY KEY,
        customerId CHAR(6) NOT NULL,
        weight NUMBER,
        routeId CHAR(6) NOT NULL,
        orderDate DATE,
        departureTime CHAR(5),
        arrivalTime CHAR(5),
        invoiceId CHAR(6) NOT NULL,
        dispatcherId CHAR(6),
        FOREIGN KEY (dispatcherId) REFERENCES EMPLOYEETABLE(employeeId)
            ON DELETE CASCADE,
        FOREIGN KEY (routeId) REFERENCES ROUTETABLE(routeId)
            ON DELETE CASCADE,
        FOREIGN KEY (invoiceId) REFERENCES INVOICETABLE(invoiceId)
            ON DELETE CASCADE,
        FOREIGN KEY (customerId) REFERENCES CUSTOMERTABLE(customerId)
            ON DELETE CASCADE    
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE TRUCKTABLE(
        plateNumber CHAR(6) PRIMARY KEY,
        model VARCHAR2(10),
        mileage INT,
        status CHAR(1), 
        parkedAt VARCHAR2(30),
        FOREIGN KEY (parkedAt) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE SET NULL
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE DRIVERDRIVESTABLE(
        plateNumber CHAR(6),
        employeeId CHAR(6),
        CONSTRAINT PK_Drives PRIMARY KEY (plateNumber,employeeId),
        FOREIGN KEY (plateNumber) REFERENCES TRUCKTABLE(plateNumber)
            ON DELETE SET NULL,
        FOREIGN KEY (employeeId) REFERENCES EMPLOYEETABLE(employeeId)
            ON DELETE SET NULL
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE ASSIGNEDTABLE(
        plateNumber CHAR(6),
        employeeId CHAR(6),
        orderId CHAR(6),
        CONSTRAINT PK_Assigned PRIMARY KEY (plateNumber,employeeId,orderId),
        FOREIGN KEY (plateNumber, employeeId) REFERENCES DRIVERDRIVESTABLE(plateNumber, employeeId)
            ON DELETE SET NULL,
        FOREIGN KEY (orderId) REFERENCES ORDERTABLE(orderId)
            ON DELETE CASCADE
    )';

END;