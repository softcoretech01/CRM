import mysql.connector

sql_script = """
-- 1. Create Individual Tables
CREATE TABLE IF NOT EXISTS master_lead_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_industries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_opportunity_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_activity_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Migrate existing data (Optional, if they exist in old masters table)
INSERT IGNORE INTO master_owners (value, is_active) SELECT value, is_active FROM masters WHERE category = 'Owner';
INSERT IGNORE INTO master_industries (value, is_active) SELECT value, is_active FROM masters WHERE category = 'Industry';
INSERT IGNORE INTO master_lead_sources (value, is_active) SELECT value, is_active FROM masters WHERE category = 'LeadSource';

-- 3. Dynamic SP for GET
DROP PROCEDURE IF EXISTS sp_get_masters;
CREATE PROCEDURE sp_get_masters(IN p_category VARCHAR(50))
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    IF p_category = 'LeadSource' THEN SET v_table_name = 'master_lead_sources';
    ELSEIF p_category = 'Industry' THEN SET v_table_name = 'master_industries';
    ELSEIF p_category = 'OpportunityStage' THEN SET v_table_name = 'master_opportunity_stages';
    ELSEIF p_category = 'ActivityType' THEN SET v_table_name = 'master_activity_types';
    ELSEIF p_category = 'Owner' THEN SET v_table_name = 'master_owners';
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category';
    END IF;

    SET @s = CONCAT('SELECT id, ''', p_category, ''' as category, value, is_active FROM ', v_table_name, ' ORDER BY value');
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;

-- 4. Dynamic SP for CREATE
DROP PROCEDURE IF EXISTS sp_create_master;
CREATE PROCEDURE sp_create_master(IN p_category VARCHAR(50), IN p_value VARCHAR(100))
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    IF p_category = 'LeadSource' THEN SET v_table_name = 'master_lead_sources';
    ELSEIF p_category = 'Industry' THEN SET v_table_name = 'master_industries';
    ELSEIF p_category = 'OpportunityStage' THEN SET v_table_name = 'master_opportunity_stages';
    ELSEIF p_category = 'ActivityType' THEN SET v_table_name = 'master_activity_types';
    ELSEIF p_category = 'Owner' THEN SET v_table_name = 'master_owners';
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category';
    END IF;

    SET @s = CONCAT('INSERT INTO ', v_table_name, ' (value) VALUES (?)');
    SET @p_val = p_value;
    PREPARE stmt FROM @s;
    EXECUTE stmt USING @p_val;
    DEALLOCATE PREPARE stmt;
    
    SELECT LAST_INSERT_ID() as id;
END;

-- 5. Dynamic SP for UPDATE
DROP PROCEDURE IF EXISTS sp_update_master;
CREATE PROCEDURE sp_update_master(IN p_id INT, IN p_category VARCHAR(50), IN p_value VARCHAR(100), IN p_is_active BOOLEAN)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    IF p_category = 'LeadSource' THEN SET v_table_name = 'master_lead_sources';
    ELSEIF p_category = 'Industry' THEN SET v_table_name = 'master_industries';
    ELSEIF p_category = 'OpportunityStage' THEN SET v_table_name = 'master_opportunity_stages';
    ELSEIF p_category = 'ActivityType' THEN SET v_table_name = 'master_activity_types';
    ELSEIF p_category = 'Owner' THEN SET v_table_name = 'master_owners';
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category';
    END IF;

    SET @s = CONCAT('UPDATE ', v_table_name, ' SET value = ?, is_active = ? WHERE id = ?');
    SET @p_val = p_value;
    SET @p_act = p_is_active;
    SET @p_i = p_id;
    PREPARE stmt FROM @s;
    EXECUTE stmt USING @p_val, @p_act, @p_i;
    DEALLOCATE PREPARE stmt;
END;

-- 6. Dynamic SP for DELETE
DROP PROCEDURE IF EXISTS sp_delete_master;
CREATE PROCEDURE sp_delete_master(IN p_id INT, IN p_category VARCHAR(50))
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    IF p_category = 'LeadSource' THEN SET v_table_name = 'master_lead_sources';
    ELSEIF p_category = 'Industry' THEN SET v_table_name = 'master_industries';
    ELSEIF p_category = 'OpportunityStage' THEN SET v_table_name = 'master_opportunity_stages';
    ELSEIF p_category = 'ActivityType' THEN SET v_table_name = 'master_activity_types';
    ELSEIF p_category = 'Owner' THEN SET v_table_name = 'master_owners';
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category';
    END IF;

    SET @s = CONCAT('DELETE FROM ', v_table_name, ' WHERE id = ?');
    SET @p_i = p_id;
    PREPARE stmt FROM @s;
    EXECUTE stmt USING @p_i;
    DEALLOCATE PREPARE stmt;
END;
"""

def run():
    try:
        conn = mysql.connector.connect(host='localhost', user='root', password='Hunter@2334', database='crm_db')
        cursor = conn.cursor()
        
        # Split statements by ; but handle procedures correctly
        # Actually it's easier to execute statements individually using multi=True or manual splitting
        statements = []
        current_stmt = []
        in_proc = False
        
        for line in sql_script.splitlines():
            line_str = line.strip()
            if line_str.startswith('--') or not line_str:
                continue
                
            current_stmt.append(line)
            
            if line_str.startswith('CREATE PROCEDURE'):
                in_proc = True
            
            if in_proc:
                if line_str == 'END;':
                    statements.append('\n'.join(current_stmt))
                    current_stmt = []
                    in_proc = False
            else:
                if line_str.endswith(';'):
                    statements.append('\n'.join(current_stmt))
                    current_stmt = []
                    
        for stmt in statements:
            if stmt.strip():
                cursor.execute(stmt)
                
        conn.commit()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    run()
