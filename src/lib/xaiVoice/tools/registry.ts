import { getBlogReadingInfoTool, getBlogReadingStateTool, getNextBlogChunkTool, goToNextBlogSectionTool, goToPreviousBlogSectionTool, listBlogSectionsTool, pauseBlogReadingTool, readBlogSectionTool, restartBlogReadingTool, resumeBlogReadingTool, startBlogReadingTool, stopBlogReadingTool } from "../blog/blogTools";
import { getContactDraftTool, getContactFormSchemaTool, getContactSubmissionResultTool, requestContactSubmissionTool, resetContactFormTool, setContactFieldTool, clearContactFieldTool } from "../contact/contactTools";
import { xaiToolDefinitions } from "./schemas";
import { extractCurrentPageContext, getAvailablePageActions } from "./pageContext";
import { searchSiteKnowledge } from "./siteSearch";
import { navigateSafely } from "./navigation";
import type { ToolHandler, XaiVoiceToolName } from "./types";

export const toolAllowlist = new Set<XaiVoiceToolName>([
  "get_current_page_context", "search_site_knowledge", "get_available_page_actions", "navigate_to_page",
  "get_contact_form_schema", "get_contact_draft", "set_contact_field", "clear_contact_field", "reset_contact_form", "request_contact_submission", "get_contact_submission_result",
  "get_blog_reading_info", "list_blog_sections", "start_blog_reading", "get_next_blog_chunk", "pause_blog_reading", "resume_blog_reading", "stop_blog_reading", "restart_blog_reading", "go_to_next_blog_section", "go_to_previous_blog_section", "read_blog_section", "get_blog_reading_state",
]);

export const toolHandlers: Record<XaiVoiceToolName, ToolHandler> = {
  get_current_page_context: async (_, context) => ({ ok: true, data: extractCurrentPageContext(context.route) }),
  search_site_knowledge: async (args, context) => ({ ok: true, data: await searchSiteKnowledge(args as { query: string; maxResults?: number }, context.signal) }),
  get_available_page_actions: async (_, context) => ({ ok: true, data: { currentRoute: context.route, actions: getAvailablePageActions(context.route) } }),
  navigate_to_page: async (args, context) => {
    if (!context.navigate || !context.waitForRouteRender) return { ok: false, error: { code: "navigation_unavailable", message: "Navigation is unavailable right now." } };
    return navigateSafely(args as { route: string; anchor?: string }, context.navigate, context.waitForRouteRender, context.signal);
  },
  get_contact_form_schema: getContactFormSchemaTool,
  get_contact_draft: getContactDraftTool,
  set_contact_field: (args) => setContactFieldTool(args as Parameters<typeof setContactFieldTool>[0]),
  clear_contact_field: (args) => clearContactFieldTool(args as Parameters<typeof clearContactFieldTool>[0]),
  reset_contact_form: resetContactFormTool,
  request_contact_submission: (args, context) => requestContactSubmissionTool(args as Parameters<typeof requestContactSubmissionTool>[0], context),
  get_contact_submission_result: getContactSubmissionResultTool,
  get_blog_reading_info: getBlogReadingInfoTool,
  list_blog_sections: listBlogSectionsTool,
  start_blog_reading: (args, context) => startBlogReadingTool(args as Parameters<typeof startBlogReadingTool>[0], context),
  get_next_blog_chunk: (args, context) => getNextBlogChunkTool(args as Parameters<typeof getNextBlogChunkTool>[0], context),
  pause_blog_reading: pauseBlogReadingTool,
  resume_blog_reading: resumeBlogReadingTool,
  stop_blog_reading: stopBlogReadingTool,
  restart_blog_reading: restartBlogReadingTool,
  go_to_next_blog_section: goToNextBlogSectionTool,
  go_to_previous_blog_section: goToPreviousBlogSectionTool,
  read_blog_section: (args, context) => readBlogSectionTool(args as Parameters<typeof readBlogSectionTool>[0], context),
  get_blog_reading_state: getBlogReadingStateTool,
};

export { xaiToolDefinitions };
export function isKnownTool(name: string): name is XaiVoiceToolName { return toolAllowlist.has(name as XaiVoiceToolName); }
