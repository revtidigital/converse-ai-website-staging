from app.services.knowledge.supabase_source import blog_row_to_source


def test_supabase_blog_filters_published_deleted() -> None:
    assert blog_row_to_source({"slug":"x","status":"draft","deleted_at":None}, base_url="https://x.test") is None
    assert blog_row_to_source({"slug":"x","status":"published","deleted_at":"now"}, base_url="https://x.test") is None
    source = blog_row_to_source({"slug":"x","status":"published","deleted_at":None,"title":"T","content":"Published public content."}, base_url="https://x.test")
    assert source and source.route == "/blog/x"
