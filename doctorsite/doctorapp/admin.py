from django.contrib import admin

from doctorapp.models import Doctor
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

"""
Zorgt ervoor dat doctors in de admin kunnen aangemaakt worden. 
De admin is toegankelijk via de url https://voorbeeld.be/admin of http://localhost:8000/admin.
Accounts etc worden opgeslaan in de lokale SQLite DB ( doctorsite/db.sqlite3 )
"""


class DoctorAdmin(admin.ModelAdmin):
    pass


class DoctorInline(admin.StackedInline):
    model = Doctor
    can_delete = False


class UserAdmin(BaseUserAdmin):
    inlines = (DoctorInline,)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Doctor, DoctorAdmin)

