from sqlalchemy.orm import Session
from . import models

def get_task(db: Session, task_id: str):
    return db.query(models.StyleTransferTask).filter(models.StyleTransferTask.id == task_id).first()

def create_task(db: Session, task_id: str):
    db_task = models.StyleTransferTask(id=task_id, status="processing")
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task_status(db: Session, task_id: str, status: str, output_url: str = None):
    db_task = get_task(db, task_id)
    if db_task:
        db_task.status = status
        db_task.output_image_url = output_url
        db.commit()
        db.refresh(db_task)
    return db_task

