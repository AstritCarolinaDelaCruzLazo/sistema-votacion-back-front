from django.db import models
import secrets


class DNIToken(models.Model):
    """Token no-expirable asociado a un DNI."""
    dni = models.CharField(max_length=16, unique=True)
    token = models.CharField(max_length=128, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def issue_for(dni: str) -> "DNIToken":
        instance, created = DNIToken.objects.get_or_create(dni=dni)
        if created or not instance.token:
            instance.token = secrets.token_urlsafe(48)
            instance.save()
        return instance

    def __str__(self) -> str:
        return f"DNIToken(dni={self.dni})"

class WebAuthnCredential(models.Model):
    """
    Credencial WebAuthn asociada a un usuario identificado por DNI.
    Nota: Para producción, validar attestation y assertions con una librería WebAuthn.
    """
    dni = models.CharField(max_length=16, db_index=True)
    user_handle = models.CharField(max_length=128)  # normalmente un id estable por usuario
    credential_id = models.CharField(max_length=512, unique=True)
    public_key = models.TextField()  # base64url u otro formato serializado
    sign_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"WebAuthnCredential(dni={self.dni}, cred={self.credential_id[:12]}...)"
