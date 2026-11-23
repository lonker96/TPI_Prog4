from typing import Generic, List, Optional, Type, TypeVar
from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    def __init__(self, model: Type[ModelT], session: Session) -> None:
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> Optional[ModelT]:
        return self.session.get(self.model, id)

    def get_all(self) -> List[ModelT]:
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.flush()
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.flush()