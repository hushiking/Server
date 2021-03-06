# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-23 03:15
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0078_auto_20160219_1152'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coupon',
            name='expired_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='coupon',
            name='validated_start',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='coupongenerator',
            name='expired_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='coupongenerator',
            name='validated_start',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
