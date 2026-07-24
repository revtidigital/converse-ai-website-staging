from app.services.knowledge.route_policy import STATIC_APPROVED_ROUTES


def repository_static_routes() -> list[str]:
    return sorted(STATIC_APPROVED_ROUTES)
