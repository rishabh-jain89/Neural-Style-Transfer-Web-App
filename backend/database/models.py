import datetime as dt
from sqlalchemy import Column, String, DateTime
from .database import Base


class StyleTransferTask(Base):

    __tablename__ = "tasks"

    
    id = Column(String, primary_key=True, index=True)

    
    status = Column(String, index=True)

    
    output_image_url = Column(String, nullable=True)

    
    created_at = Column(DateTime, default=dt.datetime.utcnow)
