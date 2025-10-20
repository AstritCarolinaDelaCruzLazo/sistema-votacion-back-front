from django.urls import path
from .views import (
    verificar_dni,
    verificar_foto,
    login_dni,
    webauthn_register_options,
    webauthn_register_verify,
    webauthn_authenticate_options,
    webauthn_authenticate_verify,
)

urlpatterns = [
    path("dni/", verificar_dni, name="verificar_dni"),
    path("face-verify/", verificar_foto, name="verificar_foto"),
    path("login-dni/", login_dni, name="login_dni"),
    # WebAuthn
    path("webauthn/register/options/", webauthn_register_options, name="webauthn_register_options"),
    path("webauthn/register/verify/", webauthn_register_verify, name="webauthn_register_verify"),
    path("webauthn/authenticate/options/", webauthn_authenticate_options, name="webauthn_authenticate_options"),
    path("webauthn/authenticate/verify/", webauthn_authenticate_verify, name="webauthn_authenticate_verify"),
]
