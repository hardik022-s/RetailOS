from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.conf import settings
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AccountProfile

User = get_user_model()


def user_payload(user):
    profile, _ = AccountProfile.objects.get_or_create(user=user)
    return {
        'name': user.get_full_name() or user.get_username(),
        'store': profile.store_name,
        'identifier': profile.phone or user.email,
    }


class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        method = request.data.get('method', 'email')
        identifier = str(request.data.get('identifier', '')).strip()
        password = request.data.get('password', '')
        name = str(request.data.get('name', '')).strip()
        store = str(request.data.get('store', '')).strip()

        if method not in ('email', 'phone') or not identifier or not password:
            return Response({'detail': 'Provide a valid method, identifier, and password.'}, status=400)
        if method == 'email' and '@' not in identifier:
            return Response({'detail': 'Enter a valid email address.'}, status=400)
        if method == 'email' and User.objects.filter(email__iexact=identifier).exists():
            return Response({'detail': 'An account with this email already exists.'}, status=400)
        if method == 'phone' and AccountProfile.objects.filter(phone=identifier).exists():
            return Response({'detail': 'An account with this phone number already exists.'}, status=400)

        try:
            validate_password(password)
        except ValidationError as exc:
            return Response({'detail': ' '.join(exc.messages)}, status=400)

        # A generated username keeps email and phone accounts compatible with Django auth.
        user = User.objects.create_user(
            username=User.objects.make_random_password(length=24),
            email=identifier if method == 'email' else '',
            password=password,
            first_name=name[:150],
        )
        AccountProfile.objects.create(user=user, phone=identifier if method == 'phone' else '', store_name=store)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_payload(user)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        method = request.data.get('method', 'email')
        identifier = str(request.data.get('identifier', '')).strip()
        password = request.data.get('password', '')
        if method not in ('email', 'phone') or not identifier or not password:
            return Response({'detail': 'Provide a valid method, identifier, and password.'}, status=400)

        if method == 'email':
            user_record = User.objects.filter(email__iexact=identifier).first()
        else:
            profile = AccountProfile.objects.select_related('user').filter(phone=identifier).first()
            user_record = profile.user if profile else None

        user = authenticate(request, username=user_record.get_username(), password=password) if user_record else None
        if not user:
            return Response({'detail': 'Email/phone or password is incorrect.'}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_payload(user)})


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotConfiguredView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        return Response(
            {'detail': 'This sign-in method is not configured on the server yet.'},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request):
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '')
        client_secret = getattr(settings, 'GOOGLE_CLIENT_SECRET', '')
        if not client_id or not client_secret:
            return Response({'detail': 'Google sign-in is not configured on the server.'}, status=503)

        origin = request.headers.get('Origin', '')
        if request.headers.get('X-Requested-With') != 'XmlHttpRequest' or origin not in settings.GOOGLE_ALLOWED_ORIGINS:
            return Response({'detail': 'Google sign-in request origin was not allowed.'}, status=403)

        code = request.data.get('code')
        if not code:
            return Response({'detail': 'Google did not return an authorization code.'}, status=400)

        # In GIS popup mode Google's code exchange uses the origin of the page
        # that opened the popup as redirect_uri.
        payload = urlencode({
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': origin,
            'grant_type': 'authorization_code',
        }).encode()
        try:
            token_request = Request(
                'https://oauth2.googleapis.com/token',
                data=payload,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                method='POST',
            )
            with urlopen(token_request, timeout=8) as response:
                google_tokens = json.loads(response.read().decode())
            access_token = google_tokens.get('access_token')
            if not access_token:
                return Response({'detail': 'Google did not return an access token.'}, status=400)

            profile_request = Request(
                'https://openidconnect.googleapis.com/v1/userinfo',
                headers={'Authorization': 'Bearer ' + access_token},
            )
            with urlopen(profile_request, timeout=8) as response:
                google_user = json.loads(response.read().decode())
        except (HTTPError, URLError, TimeoutError, ValueError):
            return Response({'detail': 'Google could not verify this sign-in. Check your OAuth settings and try again.'}, status=400)

        email = str(google_user.get('email', '')).strip().lower()
        if not email or not google_user.get('email_verified'):
            return Response({'detail': 'Google did not provide a verified email address.'}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                username=User.objects.make_random_password(length=24),
                email=email,
                first_name=str(google_user.get('given_name', '')).strip()[:150],
            )
        profile, _ = AccountProfile.objects.get_or_create(user=user)
        if not user.first_name and google_user.get('name'):
            user.first_name = str(google_user['name']).strip()[:150]
            user.save(update_fields=['first_name'])

        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_payload(user)})
