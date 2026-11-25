from django.conf import settings
from django.db import models


class AccountProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone = models.CharField(max_length=32, blank=True, db_index=True)
    store_name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.user.get_username()
