from typing import List, Tuple
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserCreate


def registrar_usuario(session: Session, data: UserCreate) -> Tuple[Usuario | None, str | None]:
    existing_username = session.exec(
        select(Usuario).where(Usuario.username == data.username)
    ).first()
    if existing_username:
        return None, "usuario_duplicado"

    existing_email = session.exec(
        select(Usuario).where(Usuario.email == data.email)
    ).first()
    if existing_email:
        return None, "usuario_duplicado"

    nuevo_usuario = Usuario(
        username=data.username,
        full_name=data.full_name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role="user",
        disabled=False,
    )
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    return nuevo_usuario, None


def autenticar_usuario(session: Session, username_or_email: str, password: str) -> Usuario:
    statement = select(Usuario).where(
        (Usuario.username == username_or_email) | (Usuario.email == username_or_email)
    )
    user = session.exec(statement).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas.",
        )

    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    return user


def listar_usuarios(session: Session) -> List[Usuario]:
    return list(session.exec(select(Usuario).order_by(Usuario.id)).all())


def activar_usuario(session: Session, user_id: int) -> Usuario:
    usuario = session.get(Usuario, user_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )
    usuario.disabled = False
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


def desactivar_usuario(session: Session, user_id: int, current_admin: Usuario) -> Usuario:
    if usuario_es_mismo_admin(user_id, current_admin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivarse a sí mismo.",
        )

    usuario = session.get(Usuario, user_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    usuario.disabled = True
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return usuario


def usuario_es_mismo_admin(target_user_id: int, current_admin: Usuario) -> bool:
    return current_admin.id == target_user_id