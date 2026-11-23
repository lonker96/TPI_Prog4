from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.database import SessionDep
from app.core.security import create_access_token, get_current_active_user, require_role
from app.modules.usuarios import service
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])
admin_users_router = APIRouter(prefix="/admin/usuarios", tags=["admin-usuarios"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(session: SessionDep, data: UserCreate) -> UserPublic:
    usuario, error = service.registrar_usuario(session, data)
    if error == "usuario_duplicado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El username o email ya se encuentra registrado.",
        )
    assert usuario is not None
    return UserPublic.model_validate(usuario)


@router.post("/token", status_code=status.HTTP_200_OK)
def login_access_token(
    response: Response,
    session: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> dict[str, str]:
    user = service.autenticar_usuario(session, form_data.username, form_data.password)
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Login exitoso"}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def read_users_me(current_user: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@admin_users_router.get("", response_model=List[UserPublic], status_code=status.HTTP_200_OK)
def listar_usuarios(
    session: SessionDep,
    current_user: Usuario = Depends(require_role(["admin"])),
) -> List[UserPublic]:
    usuarios = service.listar_usuarios(session)
    return [UserPublic.model_validate(u) for u in usuarios]


@admin_users_router.post("/{id}/activar", response_model=UserPublic, status_code=status.HTTP_200_OK)
def activar_usuario(
    session: SessionDep,
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    usuario = service.activar_usuario(session, id)
    return UserPublic.model_validate(usuario)


@admin_users_router.post("/{id}/desactivar", response_model=UserPublic, status_code=status.HTTP_200_OK)
def desactivar_usuario(
    session: SessionDep,
    id: int = Path(..., gt=0),
    current_user: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    usuario = service.desactivar_usuario(session, id, current_user)
    return UserPublic.model_validate(usuario)