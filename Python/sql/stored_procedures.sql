CREATE DATABASE IF NOT EXISTS crm_db;
USE crm_db;

-- ===================== TABLES =====================

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    source VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'New',
    assigned_to VARCHAR(100),
    industry VARCHAR(50),
    location VARCHAR(100),
    created_date DATE DEFAULT (CURDATE()),
    is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(50),
    gst VARCHAR(30),
    owner VARCHAR(100),
    location VARCHAR(100),
    address TEXT,
    is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_id INT,
    account_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    designation VARCHAR(100),
    preferred_comm VARCHAR(30),
    location VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    account_name VARCHAR(100),
    value DECIMAL(10,2),
    probability INT DEFAULT 0,
    close_date DATE,
    owner VARCHAR(100),
    stage VARCHAR(30) DEFAULT 'Prospect',
    is_active TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(150) NOT NULL,
    type VARCHAR(30),
    priority VARCHAR(20) DEFAULT 'Medium',
    due_date DATE,
    due_time TIME,
    related_to VARCHAR(150),
    notes TEXT,
    is_complete TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1
);

-- ===================== LEAD PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_leads;
DELIMITER //
CREATE PROCEDURE sp_get_leads(IN p_search VARCHAR(100), IN p_status VARCHAR(20))
BEGIN
    SELECT * FROM leads
    WHERE is_active = 1
      AND (p_search IS NULL OR p_search = '' OR name LIKE CONCAT('%',p_search,'%') OR company LIKE CONCAT('%',p_search,'%'))
      AND (p_status IS NULL OR p_status = '' OR status = p_status)
    ORDER BY id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_lead_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_lead_by_id(IN p_id INT)
BEGIN
    SELECT * FROM leads WHERE id = p_id AND is_active = 1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_lead;
DELIMITER //
CREATE PROCEDURE sp_create_lead(
    IN p_name VARCHAR(100), IN p_company VARCHAR(100), IN p_source VARCHAR(50),
    IN p_phone VARCHAR(20), IN p_email VARCHAR(100), IN p_status VARCHAR(20),
    IN p_assigned_to VARCHAR(100), IN p_industry VARCHAR(50), IN p_location VARCHAR(100)
)
BEGIN
    INSERT INTO leads(name,company,source,phone,email,status,assigned_to,industry,location)
    VALUES(p_name,p_company,p_source,p_phone,p_email,p_status,p_assigned_to,p_industry,p_location);
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_lead;
DELIMITER //
CREATE PROCEDURE sp_update_lead(
    IN p_id INT, IN p_name VARCHAR(100), IN p_company VARCHAR(100), IN p_source VARCHAR(50),
    IN p_phone VARCHAR(20), IN p_email VARCHAR(100), IN p_status VARCHAR(20),
    IN p_assigned_to VARCHAR(100), IN p_industry VARCHAR(50), IN p_location VARCHAR(100)
)
BEGIN
    UPDATE leads SET name=p_name,company=p_company,source=p_source,phone=p_phone,
        email=p_email,status=p_status,assigned_to=p_assigned_to,industry=p_industry,location=p_location
    WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_lead;
DELIMITER //
CREATE PROCEDURE sp_delete_lead(IN p_id INT)
BEGIN
    UPDATE leads SET is_active=0 WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_convert_lead;
DELIMITER //
CREATE PROCEDURE sp_convert_lead(IN p_id INT, IN p_convert_to VARCHAR(30))
BEGIN
    DECLARE v_name VARCHAR(100);
    DECLARE v_company VARCHAR(100);
    DECLARE v_phone VARCHAR(20);
    DECLARE v_email VARCHAR(100);
    DECLARE v_industry VARCHAR(50);
    DECLARE v_location VARCHAR(100);

    SELECT name,company,phone,email,industry,location
    INTO v_name,v_company,v_phone,v_email,v_industry,v_location
    FROM leads WHERE id=p_id;

    IF p_convert_to = 'Account' THEN
        INSERT INTO accounts(name,industry,owner,location) VALUES(v_company,v_industry,v_name,v_location);
    ELSEIF p_convert_to = 'Contact' THEN
        INSERT INTO contacts(name,email,phone,location) VALUES(v_name,v_email,v_phone,v_location);
    ELSEIF p_convert_to = 'Opportunity' THEN
        INSERT INTO opportunities(name,account_name,owner) VALUES(CONCAT(v_company,' Deal'),v_company,v_name);
    END IF;

    UPDATE leads SET status='Converted', is_active=0 WHERE id=p_id;
END //
DELIMITER ;

-- ===================== ACCOUNT PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_accounts;
DELIMITER //
CREATE PROCEDURE sp_get_accounts(IN p_search VARCHAR(100))
BEGIN
    SELECT * FROM accounts WHERE is_active=1
    AND (p_search IS NULL OR p_search='' OR name LIKE CONCAT('%',p_search,'%'))
    ORDER BY id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_account_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_account_by_id(IN p_id INT)
BEGIN
    SELECT * FROM accounts WHERE id=p_id AND is_active=1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_account;
DELIMITER //
CREATE PROCEDURE sp_create_account(
    IN p_name VARCHAR(100), IN p_industry VARCHAR(50), IN p_gst VARCHAR(30),
    IN p_owner VARCHAR(100), IN p_location VARCHAR(100), IN p_address TEXT
)
BEGIN
    INSERT INTO accounts(name,industry,gst,owner,location,address)
    VALUES(p_name,p_industry,p_gst,p_owner,p_location,p_address);
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_account;
DELIMITER //
CREATE PROCEDURE sp_update_account(
    IN p_id INT, IN p_name VARCHAR(100), IN p_industry VARCHAR(50), IN p_gst VARCHAR(30),
    IN p_owner VARCHAR(100), IN p_location VARCHAR(100), IN p_address TEXT
)
BEGIN
    UPDATE accounts SET name=p_name,industry=p_industry,gst=p_gst,owner=p_owner,
        location=p_location,address=p_address WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_account;
DELIMITER //
CREATE PROCEDURE sp_delete_account(IN p_id INT)
BEGIN
    UPDATE accounts SET is_active=0 WHERE id=p_id;
END //
DELIMITER ;

-- ===================== CONTACT PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_contacts;
DELIMITER //
CREATE PROCEDURE sp_get_contacts(IN p_search VARCHAR(100))
BEGIN
    SELECT * FROM contacts WHERE is_active=1
    AND (p_search IS NULL OR p_search='' OR name LIKE CONCAT('%',p_search,'%'))
    ORDER BY id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_contact_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_contact_by_id(IN p_id INT)
BEGIN
    SELECT * FROM contacts WHERE id=p_id AND is_active=1;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_contact;
DELIMITER //
CREATE PROCEDURE sp_create_contact(
    IN p_name VARCHAR(100), IN p_account_id INT, IN p_account_name VARCHAR(100),
    IN p_email VARCHAR(100), IN p_phone VARCHAR(20), IN p_designation VARCHAR(100),
    IN p_preferred_comm VARCHAR(30), IN p_location VARCHAR(100)
)
BEGIN
    INSERT INTO contacts(name,account_id,account_name,email,phone,designation,preferred_comm,location)
    VALUES(p_name,p_account_id,p_account_name,p_email,p_phone,p_designation,p_preferred_comm,p_location);
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_contact;
DELIMITER //
CREATE PROCEDURE sp_update_contact(
    IN p_id INT, IN p_name VARCHAR(100), IN p_account_id INT, IN p_account_name VARCHAR(100),
    IN p_email VARCHAR(100), IN p_phone VARCHAR(20), IN p_designation VARCHAR(100),
    IN p_preferred_comm VARCHAR(30), IN p_location VARCHAR(100)
)
BEGIN
    UPDATE contacts SET name=p_name,account_id=p_account_id,account_name=p_account_name,
        email=p_email,phone=p_phone,designation=p_designation,
        preferred_comm=p_preferred_comm,location=p_location WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_contact;
DELIMITER //
CREATE PROCEDURE sp_delete_contact(IN p_id INT)
BEGIN
    UPDATE contacts SET is_active=0 WHERE id=p_id;
END //
DELIMITER ;

-- ===================== OPPORTUNITY PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_opportunities;
DELIMITER //
CREATE PROCEDURE sp_get_opportunities()
BEGIN
    SELECT * FROM opportunities WHERE is_active=1 ORDER BY id DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_opportunities_by_stage;
DELIMITER //
CREATE PROCEDURE sp_get_opportunities_by_stage()
BEGIN
    SELECT * FROM opportunities WHERE is_active=1 ORDER BY stage, id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_opportunity;
DELIMITER //
CREATE PROCEDURE sp_create_opportunity(
    IN p_name VARCHAR(150), IN p_account VARCHAR(100), IN p_value DECIMAL(10,2),
    IN p_probability INT, IN p_close_date DATE, IN p_owner VARCHAR(100), IN p_stage VARCHAR(30)
)
BEGIN
    INSERT INTO opportunities(name,account_name,value,probability,close_date,owner,stage)
    VALUES(p_name,p_account,p_value,p_probability,p_close_date,p_owner,p_stage);
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_opportunity;
DELIMITER //
CREATE PROCEDURE sp_update_opportunity(
    IN p_id INT, IN p_name VARCHAR(150), IN p_account VARCHAR(100), IN p_value DECIMAL(10,2),
    IN p_probability INT, IN p_close_date DATE, IN p_owner VARCHAR(100), IN p_stage VARCHAR(30)
)
BEGIN
    UPDATE opportunities SET name=p_name,account_name=p_account,value=p_value,
        probability=p_probability,close_date=p_close_date,owner=p_owner,stage=p_stage WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_opportunity_stage;
DELIMITER //
CREATE PROCEDURE sp_update_opportunity_stage(IN p_id INT, IN p_stage VARCHAR(30))
BEGIN
    DECLARE v_prob INT;
    SET v_prob = CASE p_stage
        WHEN 'Prospect' THEN 30
        WHEN 'Qualification' THEN 50
        WHEN 'Proposal' THEN 70
        WHEN 'Negotiation' THEN 85
        WHEN 'Won' THEN 100
        ELSE 0 END;
    UPDATE opportunities SET stage=p_stage, probability=v_prob WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_opportunity;
DELIMITER //
CREATE PROCEDURE sp_delete_opportunity(IN p_id INT)
BEGIN
    UPDATE opportunities SET is_active=0 WHERE id=p_id;
END //
DELIMITER ;

-- ===================== ACTIVITY PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_activities;
DELIMITER //
CREATE PROCEDURE sp_get_activities()
BEGIN
    SELECT * FROM activities WHERE is_active=1 ORDER BY due_date DESC, due_time DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_activities_by_date;
DELIMITER //
CREATE PROCEDURE sp_get_activities_by_date(IN p_date DATE)
BEGIN
    SELECT * FROM activities WHERE is_active=1 AND due_date=p_date ORDER BY due_time;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_create_activity;
DELIMITER //
CREATE PROCEDURE sp_create_activity(
    IN p_subject VARCHAR(150), IN p_type VARCHAR(30), IN p_priority VARCHAR(20),
    IN p_due_date DATE, IN p_due_time TIME, IN p_related_to VARCHAR(150), IN p_notes TEXT
)
BEGIN
    INSERT INTO activities(subject,type,priority,due_date,due_time,related_to,notes)
    VALUES(p_subject,p_type,p_priority,p_due_date,p_due_time,p_related_to,p_notes);
    SELECT LAST_INSERT_ID() AS id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_activity;
DELIMITER //
CREATE PROCEDURE sp_update_activity(
    IN p_id INT, IN p_subject VARCHAR(150), IN p_type VARCHAR(30), IN p_priority VARCHAR(20),
    IN p_due_date DATE, IN p_due_time TIME, IN p_related_to VARCHAR(150), IN p_notes TEXT
)
BEGIN
    UPDATE activities SET subject=p_subject,type=p_type,priority=p_priority,
        due_date=p_due_date,due_time=p_due_time,related_to=p_related_to,notes=p_notes WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_activity;
DELIMITER //
CREATE PROCEDURE sp_delete_activity(IN p_id INT)
BEGIN
    UPDATE activities SET is_active=0 WHERE id=p_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_mark_activity_complete;
DELIMITER //
CREATE PROCEDURE sp_mark_activity_complete(IN p_id INT, IN p_complete TINYINT)
BEGIN
    UPDATE activities SET is_complete=p_complete WHERE id=p_id;
END //
DELIMITER ;

-- ===================== DASHBOARD PROCEDURES =====================

DROP PROCEDURE IF EXISTS sp_get_dashboard_kpis;
DELIMITER //
CREATE PROCEDURE sp_get_dashboard_kpis()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM leads WHERE is_active=1) AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE is_active=1 AND status='Qualified') AS qualified,
        (SELECT COUNT(*) FROM opportunities WHERE is_active=1 AND stage NOT IN ('Won')) AS open_opportunities,
        (SELECT COALESCE(SUM(value),0) FROM opportunities WHERE is_active=1 AND stage='Won') AS won_deals_value;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_lead_conversion_stats;
DELIMITER //
CREATE PROCEDURE sp_get_lead_conversion_stats()
BEGIN
    SELECT status AS name, COUNT(*) AS value FROM leads WHERE is_active=1 GROUP BY status;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_pipeline_by_stage;
DELIMITER //
CREATE PROCEDURE sp_get_pipeline_by_stage()
BEGIN
    SELECT stage AS name, COUNT(*) AS value FROM opportunities WHERE is_active=1 GROUP BY stage;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_revenue_forecast;
DELIMITER //
CREATE PROCEDURE sp_get_revenue_forecast()
BEGIN
    SELECT DATE_FORMAT(close_date,'%b') AS name,
           SUM(CASE WHEN stage='Won' THEN value ELSE 0 END) AS actual,
           SUM(value) AS target
    FROM opportunities WHERE is_active=1 AND close_date IS NOT NULL
    GROUP BY MONTH(close_date), DATE_FORMAT(close_date,'%b')
    ORDER BY MONTH(close_date);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_activity_performance;
DELIMITER //
CREATE PROCEDURE sp_get_activity_performance()
BEGIN
    SELECT CONCAT('Week ',WEEK(due_date)-WEEK(DATE_SUB(due_date,INTERVAL DAYOFMONTH(due_date)-1 DAY))+1) AS name,
           SUM(CASE WHEN type='Task' THEN 1 ELSE 0 END) AS Tasks,
           SUM(CASE WHEN type='Call' THEN 1 ELSE 0 END) AS Calls,
           SUM(CASE WHEN type='Meeting' THEN 1 ELSE 0 END) AS Meetings
    FROM activities WHERE is_active=1 AND due_date IS NOT NULL
    GROUP BY WEEK(due_date)
    ORDER BY WEEK(due_date)
    LIMIT 4;
END //
DELIMITER ;

-- ===================== SEED DATA =====================

INSERT INTO leads(name,company,source,phone,email,status,assigned_to,industry,location,created_date) VALUES
('Arjun Mehta','Infosys','LinkedIn','+91 98765 43210','arjun@infosys.com','New','Priya Sharma','IT Services','Bengaluru','2025-05-01'),
('Priya Sharma','Zoho','Website','+91 98765 43211','priya@zoho.com','Contacted','Karan Nair','Software','Chennai','2025-05-02'),
('Karan Nair','Freshworks','Referral','+91 98765 43212','karan@freshworks.com','Qualified','Divya Iyer','Software','Chennai','2025-05-03'),
('Divya Iyer','Razorpay','Cold Outreach','+91 98765 43213','divya@razorpay.com','Lost','Arjun Mehta','Fintech','Bengaluru','2025-05-03'),
('Rohan Gupta','Meesho','Webinar','+91 98765 43214','rohan@meesho.com','New','Priya Sharma','E-commerce','Bengaluru','2025-05-04'),
('Sneha Patel','Infosys','LinkedIn','+91 98765 43215','sneha@infosys.com','Contacted','Karan Nair','IT Services','Bengaluru','2025-05-04'),
('Vikram Singh','Zoho','Website','+91 98765 43216','vikram@zoho.com','Qualified','Divya Iyer','Software','Chennai','2025-05-05'),
('Ananya Desai','Freshworks','Referral','+91 98765 43217','ananya@freshworks.com','New','Arjun Mehta','Software','Chennai','2025-05-05'),
('Rahul Dev','Razorpay','Cold Outreach','+91 98765 43218','rahul@razorpay.com','Contacted','Priya Sharma','Fintech','Bengaluru','2025-05-06'),
('Neha Kapoor','Meesho','Webinar','+91 98765 43219','neha@meesho.com','New','Divya Iyer','E-commerce','Bengaluru','2025-05-06');

INSERT INTO accounts(name,industry,gst,owner,location,address) VALUES
('Infosys','IT Services','29ABCDE1234F1Z5','Arjun Mehta','Bengaluru','Plot No. 44, Electronic City, Bengaluru, Karnataka 560100'),
('Zoho','Software','33ABCDE1234F1Z5','Priya Sharma','Chennai','Estancia IT Park, Vallancherry, Tamil Nadu 603202'),
('Freshworks','Software','33ABCDE1234F1Z5','Karan Nair','Chennai','Global Infocity, Perungudi, Chennai, Tamil Nadu 600096'),
('Razorpay','Fintech','29ABCDE1234F1Z5','Divya Iyer','Bengaluru','1st Floor, SJR Cyber, Laskar-Hosur Road, Bengaluru 560030'),
('Meesho','E-commerce','29ABCDE1234F1Z5','Arjun Mehta','Bengaluru','6th Floor, Wing E, Helios Business Park, Bengaluru 560103');

INSERT INTO contacts(name,account_id,account_name,email,phone,designation,preferred_comm,location) VALUES
('Arjun Mehta',1,'Infosys','arjun@infosys.com','+91 98765 43210','CTO','Email','Bengaluru'),
('Priya Sharma',2,'Zoho','priya@zoho.com','+91 98765 43211','VP Sales','Call','Chennai'),
('Karan Nair',3,'Freshworks','karan@freshworks.com','+91 98765 43212','Product Head','WhatsApp','Chennai'),
('Divya Iyer',4,'Razorpay','divya@razorpay.com','+91 98765 43213','Financial Lead','Email','Bengaluru'),
('Rohan Gupta',5,'Meesho','rohan@meesho.com','+91 98765 43214','Director','Call','Bengaluru');

INSERT INTO opportunities(name,account_name,value,probability,close_date,owner,stage) VALUES
('Cloud Migration Project','Zoho',15.0,30,'2025-08-10','Arjun Mehta','Prospect'),
('API Integration Pack','Razorpay',4.2,60,'2025-07-20','Priya Sharma','Qualification'),
('Custom CRM Development','Infosys',25.0,40,'2025-09-15','Karan Nair','Qualification'),
('Enterprise License Q3','Infosys',12.5,80,'2025-06-15','Divya Iyer','Proposal'),
('Analytics Suite Renewal','Freshworks',8.0,90,'2025-05-30','Arjun Mehta','Negotiation'),
('Annual Support Contract','Meesho',3.5,100,'2025-05-01','Priya Sharma','Won');

INSERT INTO activities(subject,type,priority,due_date,due_time,related_to,notes,is_complete) VALUES
('Product Demo','Meeting','High','2025-05-06','14:00:00','Zoho Corp - Priya Sharma','Showcase new API integrations and discuss Q3 pricing.',0),
('Follow-up Call','Call','Medium','2025-05-06','16:30:00','Freshworks','Discuss pricing structure and enterprise terms.',0),
('Send Contract','Task','Low','2025-05-06','10:00:00','Meesho','Send final contract for annual support.',1);
