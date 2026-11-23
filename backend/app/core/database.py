from typing import Annotated, Generator
from fastapi import Depends
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)

session_factory = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def create_db_and_tables() -> None:
    create_all_tables()


def get_session() -> Generator[Session, None, None]:
    with session_factory() as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]