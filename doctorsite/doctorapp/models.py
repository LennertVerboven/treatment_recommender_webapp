from django.db import models


class Doctor(models.Model):
    user = models.OneToOneField('auth.User', primary_key=True,
                                on_delete=models.CASCADE)
    hospital = models.CharField(max_length=300, default='Unknown')
    created_on = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return 'Dr {}'.format(self.user.get_full_name())
