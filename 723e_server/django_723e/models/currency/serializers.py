from django_723e.models.currency.models import Currency
from rest_framework import serializers

class CurrencySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Currency
        fields = ('id', 'name', 'sign', 'space', 'after_amount')
