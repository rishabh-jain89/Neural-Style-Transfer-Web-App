import uuid
import os
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, Depends, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import crud, database
from database import models
from database.database import SessionLocal, engine
from style import run_style_transfer

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Neural Style Transfer API")

origins = [
    "http://localhost:3000", "http://localhost:5173",
    "http://127.0.0.1:5173", "http://localhost:63342",
    "https://neural-style-transfer-web-app.vercel.app/",
]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

UPLOADS_DIR = "uploads"
OUTPUTS_DIR = "outputs"
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
app.mount(f"/{OUTPUTS_DIR}", StaticFiles(directory=OUTPUTS_DIR), name="outputs")


def process_images_in_background(content_path: str, style_path: str, task_id: str, resolution: int, style_weight: int):
    db = SessionLocal()
    output_path = os.path.join(OUTPUTS_DIR, f"{task_id}.jpg")

    try:
        run_style_transfer(
            content_img_path=content_path,
            style_img_path=style_path,
            output_path=output_path,
            output_size=resolution,
            style_weight=style_weight,
            num_steps=300
        )
        output_url = f"/{output_path}"
        crud.update_task_status(db, task_id=task_id, status="complete", output_url=output_url)

    except Exception as e:
        print(f"Task {task_id} failed with error: {e}")
        crud.update_task_status(db, task_id=task_id, status="failed")
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Neural Style Transfer API!"}


@app.post("/stylize/")
async def create_stylization_task(
        background_tasks: BackgroundTasks,
        content_image: UploadFile = File(...),
        style_image: UploadFile = File(...),
        resolution: int = Form(512),
        style_weight: int = Form(1000000),
        db: Session = Depends(database.get_db)
):
    task_id = str(uuid.uuid4())
    content_path = os.path.join(UPLOADS_DIR, f"{task_id}_content_{content_image.filename}")
    style_path = os.path.join(UPLOADS_DIR, f"{task_id}_style_{style_image.filename}")

    with open(content_path, "wb") as f:
        f.write(await content_image.read())
    with open(style_path, "wb") as f:
        f.write(await style_image.read())

    crud.create_task(db, task_id=task_id)

    background_tasks.add_task(process_images_in_background, content_path, style_path, task_id, resolution, style_weight)

    return {"message": "Processing started", "task_id": task_id}


@app.get("/status/{task_id}")
async def get_task_status(task_id: str, db: Session = Depends(database.get_db)):
    task = crud.get_task(db, task_id=task_id)
    if not task:
        return JSONResponse(status_code=404, content={"status": "not_found", "message": "Task not found"})

    return {"status": task.status, "url": task.output_image_url}
