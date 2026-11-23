from types import TracebackType
from typing import Optional, Type
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self._session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self.session: Session = self._session_factory()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()