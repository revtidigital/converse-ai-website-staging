import type { JsonObject, XaiRegisteredTool, XaiToolDefinition } from "./types";

export class XaiToolRegistry {
  private readonly tools = new Map<string, XaiRegisteredTool>();

  register<TArgs extends JsonObject>(tool: XaiRegisteredTool<TArgs>) {
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tool.definition.name)) throw new Error(`Invalid xAI tool name: ${tool.definition.name}`);
    if (this.tools.has(tool.definition.name)) throw new Error(`Duplicate xAI tool name: ${tool.definition.name}`);
    this.tools.set(tool.definition.name, tool as XaiRegisteredTool);
    return this;
  }

  get(name: string): XaiRegisteredTool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  definitions(): XaiToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }
}

export function createXaiToolRegistry(tools: XaiRegisteredTool[] = []) {
  const registry = new XaiToolRegistry();
  tools.forEach((tool) => registry.register(tool));
  return registry;
}
