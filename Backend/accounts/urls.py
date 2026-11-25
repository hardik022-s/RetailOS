from django.urls import path

from .views import GoogleAuthView, LoginView, LogoutView, NotConfiguredView, SignupView

urlpatterns = [
    path('login', LoginView.as_view(), name='api-login'),
    path('signup', SignupView.as_view(), name='api-signup'),
    path('logout', LogoutView.as_view(), name='api-logout'),
    path('forgot', NotConfiguredView.as_view(), name='api-password-reset'),
    path('google', GoogleAuthView.as_view(), name='api-google-auth'),
]
