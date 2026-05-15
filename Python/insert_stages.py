import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='Hunter@2334', database='crm_db')
cursor = conn.cursor()

# Insert Opportunity Stages into masters table
stages = ['Prospect', 'Qualification', 'Proposal', 'Negotiation', 'Won']
for stage in stages:
    cursor.execute(
        "INSERT IGNORE INTO masters (category, value) VALUES (%s, %s)",
        ('OpportunityStage', stage)
    )

conn.commit()

# Verify insertion
cursor.execute("SELECT id, category, value, is_active FROM masters WHERE category = 'OpportunityStage'")
rows = cursor.fetchall()
print(f"Opportunity Stages in DB ({len(rows)} rows):")
for r in rows:
    print(f"  id={r[0]}, category={r[1]}, value={r[2]}, is_active={r[3]}")

cursor.close()
conn.close()
