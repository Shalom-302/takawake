from .google import GoogleOAuth
from .facebook import FacebookOAuth
from .github import GithubOAuth
from .gitlab import GitlabOAuth
from .linkedin import LinkedinOAuth
from .microsoft import MicrosoftOAuth
from .apple import AppleOAuth

__all__ = [
    "GoogleOAuth",
    "FacebookOAuth",
    "GithubOAuth",
    "GitlabOAuth",
    "LinkedinOAuth",
    "MicrosoftOAuth",
    "AppleOAuth"
]
