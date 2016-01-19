from django.conf.urls import include, url
from . import views


urlpatterns = [
    url(r'^$', views.index, name="index"),
    url(r'^login/$', views.login, name="login"),
    url(r'^login/auth/$', views.login_auth, name="login_auth"),
    url(r'^logout/$', views.logout, name="logout"),
    url(r'^students/$', views.StudentView.as_view(), name="students"),
    url(r'^teachers/$', views.TeacherView.as_view(), name="teachers"),
    url(r'^teachers/action/$', views.TeacherActionView.as_view(), name="teachers_action"),
    url(r'^schools/$', views.SchoolView.as_view(), name="schools"),
    url(r'^backcost/$', views.BackCostView.as_view(), name="backcost"),
    url(r'^orders/review/$', views.OrderReviewView.as_view(), name="orders_review"),
]
