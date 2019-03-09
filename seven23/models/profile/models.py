"""
    Terms and Conditions models
"""
from datetime import datetime
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from django.db.models.signals import post_save
from django.dispatch import receiver

from seven23.models.stats.models import MonthlyActiveUser, DailyActiveUser

class Profile(models.Model):
    """
        Discount token on puschase in SAS mode.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    last_api_call = models.DateField(_(u'Last API call'),
                                help_text=_(u'Last call on the API as a registered user'),
                                auto_now_add=True,
                                editable=False)

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance)

            now = datetime.now()
            # Add it as active user
            monthlyActiveUser = MonthlyActiveUser.objects.get_or_create(year=now.year, month=now.month)[0]
            monthlyActiveUser.counter += 1
            monthlyActiveUser.save()

            dailyActiveUser = DailyActiveUser.objects.get_or_create(year=now.year, month=now.month, day=now.day)[0]
            dailyActiveUser.counter += 1
            dailyActiveUser.save()

    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()

    def __str__(self):
        return u'%s' % (self.user)