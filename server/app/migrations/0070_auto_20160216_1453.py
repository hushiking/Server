# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-16 06:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0069_auto_20160216_1128'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='school',
            name='service',
        ),
        migrations.AddField(
            model_name='school',
            name='member_service',
            field=models.ManyToManyField(to='app.Memberservice'),
        ),
    ]
