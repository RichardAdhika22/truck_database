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
        coordinate VARCHAR2(30) PRIMARY KEY,
        city VARCHAR2(20),
        address VARCHAR2(40) NOT NULL,
        capacity INT,
        trucksParked INT,
        closeTime CHAR(5),
        openTime CHAR(5)
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE ROUTETABLE (
        routeID CHAR(6) PRIMARY KEY,
        origin VARCHAR2(30) NOT NULL,
        destination VARCHAR2(30) NOT NULL,
        distance NUMBER,
        FOREIGN KEY (origin) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE CASCADE,
        FOREIGN KEY (destination) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE ORDERTABLE (
        orderID CHAR(6) PRIMARY KEY,
        customerID CHAR(6) NOT NULL,
        weight NUMBER,
        routeID CHAR(6) NOT NULL,
        orderDate DATE,
        departureTime CHAR(5),
        arrivalTime CHAR(5),
        invoiceID CHAR(6) NOT NULL,
        employeeID CHAR(6),
        FOREIGN KEY (employeeID) REFERENCES EMPLOYEETABLE(employeeID)
            ON DELETE NO ACTION,
        FOREIGN KEY (routeID) REFERENCES ROUTETABLE(routeID)
            ON DELETE NO ACTION,
        FOREIGN KEY (invoiceID) REFERENCES INVOICETABLE(invoiceID)
            ON DELETE NO ACTION,
        FOREIGN KEY (customerID) REFERENCES CUSTOMERTABLE(customerID)
            ON DELETE NO ACTION    
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE INVOICETABLE (
        invoiceID CHAR(6) PRIMARY KEY,
        issueDate DATE,
        status CHAR(1),
        orderID CHAR(6) NOT NULL,
        FOREIGN KEY (orderID) REFERENCES ORDERTABLE(routeID)
            ON DELETE CASCADE
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE CUSTOMERTABLE (
        customerID CHAR(6) PRIMARY KEY,
        phoneNumber CHAR(12),
        email VARCHAR2(30),
        name VARCHAR2(25) NOT NULL
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE EMPLOYEETABLE(
    employeeID CHAR(6) PRIMARY KEY,
    sin CHAR(9) UNIQUE,
    phoneNumber CHAR(12),
    email VARCHAR2(30),
    workLocation VARCHAR2(30),
    FOREIGN KEY (workLocation) REFERENCES LOCATIONTABLE(coordinate)
            ON DELETE SET NULL
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE DISPATCHERTABLE(
    employeeID CHAR(6) PRIMARY KEY,
    dispatcherID CHAR(6) UNIQUE,
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEETABLE(employeeID)
            ON DELETE CASCADE
    )';

    EXECUTE IMMEDIATE 'CREATE TABLE DRIVERTABLE(
    employeeID CHAR(6) PRIMARY KEY,
    licenceID CHAR(8) UNIQUE,
    hoursDriven NUMBER,
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEETABLE(employeeID)
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
    employeeID CHAR(6),
    CONSTRAINT PK_Drives PRIMARY KEY (plateNumber,employeeID),
    FOREIGN KEY (plateNumber) REFERENCES TRUCKTABLE(plateNumber)
            ON DELETE SET NULL,
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEETABLE(employeeID)
            ON DELETE SET NULL
    )';


    EXECUTE IMMEDIATE 'CREATE TABLE ASSIGNEDTABLE(
    plateNumber CHAR(6),
    employeeID CHAR(6),
    orderID CHAR(6),
    CONSTRAINT PK_Assigned PRIMARY KEY (plateNumber,employeeID,orderID),
    FOREIGN KEY (plateNumber) REFERENCES DRIVERDRIVESTABLE(plateNumber)
            ON DELETE SET NULL,
    FOREIGN KEY (employeeID) REFERENCES DRIVERDRIVESTABLE(employeeID)
            ON DELETE SET NULL,
    FOREIGN KEY (orderID) REFERENCES ORDERTABLE(orderID)
            ON DELETE CASCADE
    )';

END;