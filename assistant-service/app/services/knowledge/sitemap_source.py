import re


def parse_sitemap_routes(xml: str) -> list[str]:
    routes: list[str] = []
    for loc in re.findall(r"<loc>(.*?)</loc>", xml):
        parts = loc.split("/", 3)
        routes.append("/" + parts[3] if len(parts) > 3 else "/")
    return routes
