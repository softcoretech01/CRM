import mysql.connector
conn = mysql.connector.connect(host='localhost', user='root', password='Hunter@2334', database='crm_db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS masters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_value (category, value)
);
''')

cursor.execute('DROP PROCEDURE IF EXISTS sp_get_masters;')
cursor.execute('''
CREATE PROCEDURE sp_get_masters(IN p_category VARCHAR(50))
BEGIN
    IF p_category IS NULL OR p_category = '' THEN
        SELECT id, category, value, is_active FROM masters ORDER BY category, value;
    ELSE
        SELECT id, category, value, is_active FROM masters WHERE category = p_category AND is_active = 1 ORDER BY value;
    END IF;
END
''')

cursor.execute('DROP PROCEDURE IF EXISTS sp_create_master;')
cursor.execute('''
CREATE PROCEDURE sp_create_master(IN p_category VARCHAR(50), IN p_value VARCHAR(100))
BEGIN
    INSERT INTO masters (category, value) VALUES (p_category, p_value);
    SELECT LAST_INSERT_ID() as id;
END
''')

cursor.execute('DROP PROCEDURE IF EXISTS sp_update_master;')
cursor.execute('''
CREATE PROCEDURE sp_update_master(IN p_id INT, IN p_category VARCHAR(50), IN p_value VARCHAR(100), IN p_is_active BOOLEAN)
BEGIN
    UPDATE masters SET category = p_category, value = p_value, is_active = p_is_active WHERE id = p_id;
END
''')

cursor.execute('DROP PROCEDURE IF EXISTS sp_delete_master;')
cursor.execute('''
CREATE PROCEDURE sp_delete_master(IN p_id INT)
BEGIN
    DELETE FROM masters WHERE id = p_id;
END
''')

# Insert some default data
try:
    cursor.execute("INSERT IGNORE INTO masters (category, value) VALUES ('Owner', 'Arjun Mehta'), ('Owner', 'Priya Sharma'), ('Owner', 'Karan Nair'), ('Owner', 'Divya Iyer'), ('Industry', 'Technology'), ('Industry', 'Retail'), ('Industry', 'Manufacturing'), ('Industry', 'Finance'), ('Industry', 'Healthcare'), ('LeadSource', 'Website'), ('LeadSource', 'Referral'), ('LeadSource', 'LinkedIn'), ('LeadSource', 'Cold Call');")
except Exception as e:
    pass

conn.commit()
print('Masters DB setup complete.')
