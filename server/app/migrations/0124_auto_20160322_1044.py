# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-03-22 02:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0123_auto_20160321_1803'),
    ]

    operations = [
        migrations.AddField(
            model_name='certificate',
            name='audited',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='certificate',
            name='show_hint',
            field=models.BooleanField(default=False),
        ),
    ]
