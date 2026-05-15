from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from database import get_connection
from models.master import MasterCreate, MasterUpdate, MasterResponse
import mysql.connector

router = APIRouter(
    prefix="/api/masters",
    tags=["Masters"]
)

@router.get("/", response_model=List[MasterResponse])
def get_masters(category: Optional[str] = None):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_get_masters', (category,))
        
        result = []
        for res in cursor.stored_results():
            result.extend(res.fetchall())
            
        return result
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.post("/", response_model=MasterResponse)
def create_master(master: MasterCreate):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_create_master', (master.category, master.value))
        
        master_id = None
        for res in cursor.stored_results():
            row = res.fetchone()
            if row:
                master_id = row['id']
                
        conn.commit()
        return {**master.dict(), "id": master_id}
    except mysql.connector.Error as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.put("/{master_id}", response_model=MasterResponse)
def update_master(master_id: int, master: MasterUpdate):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc('sp_update_master', (master_id, master.category, master.value, master.is_active))
        conn.commit()
        return {**master.dict(), "id": master_id}
    except mysql.connector.Error as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@router.delete("/{master_id}")
def delete_master(master_id: int, category: str = Query(...)):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.callproc('sp_delete_master', (master_id, category))
        conn.commit()
        return {"message": "Master deleted successfully"}
    except mysql.connector.Error as err:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
