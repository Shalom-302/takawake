from typing import Any

from fastapi import HTTPException
from fastapi import status
# from httpx import AsyncClient
from pydantic_core import Url

from .base import OAuthBase
from ..schemas import OAuthCodeResponseSchema
from ..schemas import OAuthRedirectLink
from ..schemas import OAuthTokenResponseSchema
from ..schemas import OAuthUserDataResponseSchema
from ..schemas import SocialTypes


class GithubOAuth(OAuthBase):
    """
    Config Github
    https://github.com/settings/developers
    """

    scope = ["user:email"]

    access_type = "offline"
    grand_type = "authorization_code"

    def generate_body_for_access_token(self, code: OAuthCodeResponseSchema) -> str:
        """
        Generating the request body to send to the service to receive the user's token.
        """

        return (
            f"code={code.code}&"
            f"client_id={self.client_id}&"
            f"client_secret={self.secret_key}&"
            f"grant_type={self.grand_type}&"
            f"redirect_uri={self.webhook_redirect_uri}"
        )

    def prepare_user_data(
        self, external_id: str, user_data: dict[Any, Any]
    ) -> OAuthUserDataResponseSchema:
        """Converting interface socials for the general data format of the system"""

        return OAuthUserDataResponseSchema(
            external_id=external_id,
            email=user_data["email"],
            social_type=SocialTypes.github,
            img=user_data["avatar_url"],
            firstname=user_data["firstname"],
            lastname=user_data["lastname"],
        )

    def generate_link_for_code(self) -> OAuthRedirectLink:
        """
        Generating a link to a redirect to the service to receive a confirmation code.
        It is necessary for the user to further enter the service
        and receive a confirmation code from the service on Webhook.
        """

        url = (
            "https://github.com/login/oauth/authorize?"
            f"scope={self.scope_to_str()}&"
            f"access_type={self.access_type}&"
            f"response_type={self.response_type}&"
            f"redirect_uri={self.webhook_redirect_uri}&"
            f"client_id={self.client_id}"
        )

        return OAuthRedirectLink(url=Url(url=url))

    async def get_token(
        self, code: OAuthCodeResponseSchema
    ) -> OAuthTokenResponseSchema:
        """Exchange of a confirmation code for a user token."""

        response = await self.session.post(
            url="https://github.com/login/oauth/access_token",
            data=self.generate_body_for_access_token(code),
            headers={"Accept": "application/json"},
        )

        if response.status_code != status.HTTP_200_OK:

            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()["error_description"],
            )

        token_data = response.json()
        return OAuthTokenResponseSchema(token=token_data["access_token"])

    async def get_user_data(
        self, token: OAuthTokenResponseSchema
    ) -> OAuthUserDataResponseSchema:
        """ "Getting information about a user through an access token."""

        response = await self.session.get(
            url="https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {token.token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
        user_data = response.json()
        if response.status_code != status.HTTP_200_OK:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=user_data["error_description"],
            )
        user_emails = await self.session.get(
            "https://api.github.com/user/public_emails",
            headers={
                "Authorization": f"Bearer {token.token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        )
        user_data["firstname"] = user_data["name"].split(" ")[0]
        user_data["lastname"] = (
            user_data["name"].replace(user_data["firstname"], "").strip()
        )

        user_data["email"] = user_emails.json()[1]["email"]

        return self.prepare_user_data(str(user_data["id"]), user_data)

    async def verify_and_process(
        self, code: OAuthCodeResponseSchema
    ) -> OAuthUserDataResponseSchema:
        token = await self.get_token(code=code)
        datas = await self.get_user_data(token=token)
        return datas


# github_oauth = GithubOAuth(
#     session=AsyncClient(),
#     client_id=settings.GITHUB_CLIENT_ID,
#     secret_key=settings.GITHUB_SECRET_KEY,
#     webhook_redirect_uri=f"{settings.API_URL}{settings.CLIENT_ROOT_PATH}{settings.API_BASE_URL}{settings.GITHUB_WEBHOOK_OAUTH_REDIRECT_URI}",
# )
