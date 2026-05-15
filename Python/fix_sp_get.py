import mysql.connector

sql_script = """
DROP PROCEDURE IF EXISTS sp_get_masters;
CREATE PROCEDURE sp_get_masters(IN p_category VARCHAR(50))
BEGIN
    IF p_category IS NULL OR p_category = '' THEN
        SELECT id, 'LeadSource' as category, value, is_active FROM master_lead_sources
        UNION ALL
        SELECT id, 'Industry' as category, value, is_active FROM master_industries
        UNION ALL
        SELECT id, 'OpportunityStage' as category, value, is_active FROM master_opportunity_stages
        UNION ALL
        SELECT id, 'ActivityType' as category, value, is_active FROM master_activity_types
        UNION ALL
        SELECT id, 'Owner' as category, value, is_active FROM master_owners;
    ELSE
        IF p_category = 'LeadSource' THEN 
            SELECT id, 'LeadSource' as category, value, is_active FROM master_lead_sources ORDER BY value;
        ELSEIF p_category = 'Industry' THEN 
            SELECT id, 'Industry' as category, value, is_active FROM master_industries ORDER BY value;
        ELSEIF p_category = 'OpportunityStage' THEN 
            SELECT id, 'OpportunityStage' as category, value, is_active FROM master_opportunity_stages ORDER BY value;
        ELSEIF p_category = 'ActivityType' THEN 
            SELECT id, 'ActivityType' as category, value, is_active FROM master_activity_types ORDER BY value;
        ELSEIF p_category = 'Owner' THEN 
            SELECT id, 'Owner' as category, value, is_active FROM master_owners ORDER BY value;
        ELSE 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid category';
        END IF;
    END IF;
END;
"""

conn = mysql.connector.connect(host='localhost', user='root', password='Hunter@2334', database='crm_db')
cursor = conn.cursor()
cursor.execute("DROP PROCEDURE IF EXISTS sp_get_masters")
cursor.execute(sql_script.replace("DROP PROCEDURE IF EXISTS sp_get_masters;", ""))
conn.commit()
print("Success")
