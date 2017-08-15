# -*- coding: utf-8 -*-
"""
    Tests for accounts module

"""
import datetime

from django.test import TransactionTestCase
# Default user model may get swapped out of the system and hence.
from django.contrib.auth.models import User

from seven23.models.accounts.models import Account, AccountGuests
from seven23.models.currency.models import Currency
from seven23.models.categories.models import Category
from seven23.models.transactions.models import DebitsCredits, Change

class AccountTest(TransactionTestCase):
    """ Account test """

    def setUp(self):
        """
            Create a set of data to access during tests
            user foo
            currency euro, chf, thb
            account user.foo.account
            categories category1, category2
        """
        self.user = User.objects.create()
        self.user.username = "foo"
        self.user.save()

        self.euro = Currency.objects.create(
            name="Euro", sign=u"\u20AC", space=True, after_amount=True)
        self.chf = Currency.objects.create(name="Franc suisse", sign="CHF")
        self.thb = Currency.objects.create(name=u"Bahts Thaïlandais", sign="BHT")
        self.usd = Currency.objects.create(name=u"US Dollars", sign="USD")
        self.account = Account.objects.create(owner=self.user,
                                              name="Compte courant",
                                              currency=self.euro)
        self.cat1 = Category.objects.create(account=self.account, name="Category 1")
        self.cat2 = Category.objects.create(account=self.account, name="Category 2")

    def test_create_account(self):
        """
            Create a profile, and a standard account in euro currency.
        """
        self.assertNotEqual(self.account, None)
        AccountGuests.objects.create(account=self.account, user=self.user, permissions='A')
        self.assertEqual(len(self.account.guests.all()), 1)

    def test_change_currency(self):
        """
            Test is changing an account currency propagate well to all transactions.
        """
        self.account = Account.objects.create(owner=self.user,
                                              name="Compte courant",
                                              currency=self.euro)

        # Transaction in Eur will have no difference between amount and foreign_amount
        transaction1 = DebitsCredits.objects.create(account=self.account,
                                                    date=datetime.datetime.today() -
                                                    datetime.timedelta(days=20),
                                                    name="Buy a 6 EUR item",
                                                    local_amount=6,
                                                    local_currency=self.euro)
        # After this point, transaction 1 Should have no reference Value
        transaction1 = DebitsCredits.objects.get(pk=transaction1.pk)
        self.assertEqual(transaction1.local_amount, 6)

        # Now we had a Change rate before the transaction 1, and change the account currency
        Change.objects.create(account=self.account,
                              date=datetime.datetime.today() - datetime.timedelta(days=30),
                              name="Withdraw",
                              local_amount=6,
                              local_currency=self.euro,
                              new_amount=4,
                              new_currency=self.chf)

        self.account = Account.objects.get(pk=self.account.pk)
        self.account.currency = self.chf
        self.account.save()

        # After this point, transaction 1 Should have no reference Value
        transaction1 = DebitsCredits.objects.get(pk=transaction1.pk)
        self.assertEqual(transaction1.local_amount, 6)