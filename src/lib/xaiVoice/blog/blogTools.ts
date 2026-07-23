import { getBlogReadingInfo, getBlogReadingState, getNextBlogChunk, goToNextBlogSection, goToPreviousBlogSection, listBlogSections, pauseBlogReading, readBlogSection, restartBlogReading, resumeBlogReading, startBlogReading, stopBlogReading } from "./blogReaderBridge";
import type { ToolExecutionContext, ToolResult } from "../tools/types";

export const getBlogReadingInfoTool = (_: unknown, context: ToolExecutionContext): ToolResult => ({ ok: true, data: getBlogReadingInfo(context.route) });
export const listBlogSectionsTool = (_: unknown, context: ToolExecutionContext): ToolResult => listBlogSections(context.route);
export const startBlogReadingTool = (args: { startMode?: "beginning" | "current-section" | "named-section"; sectionId?: string }, context: ToolExecutionContext): ToolResult => startBlogReading(args, context.route);
export const getNextBlogChunkTool = (args: { narrationGeneration?: number }, context: ToolExecutionContext): ToolResult => getNextBlogChunk(args, context.route);
export const pauseBlogReadingTool = (_: unknown, context: ToolExecutionContext): ToolResult => pauseBlogReading(context.route);
export const resumeBlogReadingTool = (_: unknown, context: ToolExecutionContext): ToolResult => resumeBlogReading(context.route);
export const stopBlogReadingTool = (_: unknown, context: ToolExecutionContext): ToolResult => stopBlogReading(context.route);
export const restartBlogReadingTool = (_: unknown, context: ToolExecutionContext): ToolResult => restartBlogReading(context.route);
export const goToNextBlogSectionTool = (_: unknown, context: ToolExecutionContext): ToolResult => goToNextBlogSection(context.route);
export const goToPreviousBlogSectionTool = (_: unknown, context: ToolExecutionContext): ToolResult => goToPreviousBlogSection(context.route);
export const readBlogSectionTool = (args: { sectionId?: string; sectionName?: string }, context: ToolExecutionContext): ToolResult => readBlogSection(args, context.route);
export const getBlogReadingStateTool = (_: unknown, context: ToolExecutionContext): ToolResult => ({ ok: true, data: getBlogReadingState(context.route) });
