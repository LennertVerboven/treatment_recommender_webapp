from typing import Dict

from django.views import View
from rest_framework import permissions
from rest_framework.request import Request


class RedcapIsDoctor(permissions.BasePermission):
    """
    Custom permission to only allow doctors to see their patients.
    """
    def has_object_permission(self, request: Request, view: View, patient: Dict):
        # All permissions are only allowed to the doctor of the patient.
        if request.user:
            return request.user.is_superuser or request.user.id in patient['assoc_doctors']
        return False

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return True
        return False
