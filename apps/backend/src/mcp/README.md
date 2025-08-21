# Detective MCP Server

A Model Context Protocol (MCP) server that enables LLMs to analyze code quality, detect problems, and understand code evolution in JavaScript/TypeScript projects using Detective's powerful analysis tools.

## Overview

This MCP server provides AI assistants with comprehensive code analysis capabilities:

- **Repository Intelligence**: Understand project structure and metadata
- **Trend Analysis**: Track code quality evolution over time
- **X-Ray Analysis**: Deep inspection of individual files
- **Hotspot Detection**: Identify problematic code areas
- **Project Navigation**: Explore file and folder structures

## Available Tools

### 1. `get_repository_info`

**Purpose**: Get comprehensive repository metadata to understand the codebase context.

**When to use**: Always call this first to understand what repository you are analyzing.

**Parameters**: None

**Returns**:

```json
{
  "repository": {
    "name": "project-name",
    "path": "/absolute/path/to/repo",
    "isGitRepo": true,
    "remotes": {
      "origin": "https://github.com/user/repo.git"
    }
  },
  "git": {
    "currentBranch": "main",
    "lastCommit": {
      "hash": "abc123...",
      "message": "Latest commit message",
      "author": "Developer Name",
      "date": "2024-01-20"
    },
    "totalCommits": 1234,
    "contributors": 15
  },
  "project": {
    "type": "nx-monorepo",
    "language": "typescript",
    "frameworks": ["angular", "express"],
    "fileStats": {
      "totalFiles": 500,
      "byExtension": {
        ".ts": 300,
        ".html": 100,
        ".css": 50
      }
    }
  },
  "capabilities": {
    "trendAnalysis": true,
    "xrayAnalysis": true,
    "hotspotDetection": true,
    "supportedExtensions": [".ts", ".js", ".tsx", ".jsx"]
  }
}
```

### 2. `analyze_trends`

**Purpose**: Analyze how code quality changes over time to identify deteriorating files.

**When to use**: To understand code evolution and identify files that are getting more complex.

**Parameters**:

- `maxCommits` (number, 1-1000, default: 50): Number of commits to analyze
- `fileExtensions` (string[], default: [".ts", ".js", ".tsx", ".jsx"]): File types to include
- `parallelWorkers` (number, 1-10, default: 5): Number of parallel analysis workers

**Returns**:

```json
{
  "success": true,
  "data": {
    "fileMetrics": [
      {
        "filePath": "src/components/Button.tsx",
        "changeFrequency": 15,
        "averageComplexity": 8.5,
        "averageSize": 120,
        "complexityTrend": [5, 7, 8, 9, 8],
        "sizeTrend": [80, 95, 110, 130, 120]
      }
    ],
    "commitsAnalyzed": 50,
    "filesAnalyzed": 42,
    "totalProcessingTimeMs": 5432
  },
  "summary": {
    "filesAnalyzed": 42,
    "commitsAnalyzed": 50,
    "processingTimeMs": 5432,
    "topChangedFiles": [
      {
        "filePath": "src/components/Button.tsx",
        "changeFrequency": 15,
        "averageComplexity": 8.5
      }
    ]
  }
}
```

### 3. `xray_analyze`

**Purpose**: Deep code inspection of a single file's structure and quality.

**When to use**: To understand code organization, complexity, and dependencies of specific files.

**Parameters**:

- `filePath` (string, required): Path to the file to analyze
- `includeSource` (boolean, default: false): Whether to include source code in response

**Returns**:

```json
{
  "success": true,
  "data": {
    "file": "src/components/Button.tsx",
    "metrics": {
      "methodLevel": {
        "Button.render": {
          "complexity": 5,
          "lines": 25,
          "parameters": 2
        }
      },
      "classLevel": {
        "Button": {
          "methods": 3,
          "complexity": 12,
          "cohesion": 0.8
        }
      },
      "dataStructure": {
        "interfaces": 2,
        "types": 1
      },
      "inheritance": {
        "depth": 1,
        "children": 0
      },
      "organization": {
        "imports": 8,
        "exports": 1,
        "coupling": 0.3
      },
      "typescript": {
        "typeComplexity": 3,
        "genericUsage": 1
      }
    }
  },
  "summary": {
    "filePath": "src/components/Button.tsx",
    "totalMethods": 3,
    "totalClasses": 1,
    "averageComplexity": 8.5,
    "maxComplexity": 12,
    "analysisTimeMs": 150
  }
}
```

### 4. `detect_hotspots`

**Purpose**: Find problematic areas in the codebase that need attention.

**When to use**: To identify files that need refactoring based on change frequency and complexity.

**Parameters**:

- `minScore` (number, default: -1): Minimum hotspot score threshold
- `module` (string, default: ""): Filter by module/directory
- `metric` ("McCabe" | "Length", default: "McCabe"): Complexity metric to use

**Returns**:

```json
{
  "success": true,
  "data": {
    "hotspots": [
      {
        "fileName": "src/legacy/OldComponent.tsx",
        "commits": 45,
        "changedLines": 1200,
        "complexity": 25,
        "score": 1125
      }
    ]
  },
  "summary": {
    "totalHotspots": 12,
    "averageScore": 285.5,
    "maxScore": 1125,
    "criticalFiles": ["src/legacy/OldComponent.tsx", "src/utils/ComplexHelper.ts"]
  }
}
```

### 5. `get_file_structure`

**Purpose**: Get the hierarchical file and folder structure of the project.

**When to use**: To understand project organization and navigate the codebase.

**Parameters**:

- `path` (string, default: "."): Starting path for structure analysis
- `extensions` (string[], default: [".ts", ".js", ".tsx", ".jsx"]): File extensions to include
- `includeGitIgnored` (boolean, default: false): Whether to include git-ignored files

**Returns**:

```json
{
  "success": true,
  "data": {
    "name": "project-root",
    "path": ".",
    "type": "directory",
    "children": [
      {
        "name": "src",
        "path": "src",
        "type": "directory",
        "children": [
          {
            "name": "index.ts",
            "path": "src/index.ts",
            "type": "file",
            "extension": ".ts",
            "size": 2048
          }
        ]
      }
    ]
  },
  "summary": {
    "totalFiles": 156,
    "totalDirectories": 23,
    "filesByExtension": {
      ".ts": 98,
      ".tsx": 45,
      ".html": 8,
      ".css": 5
    }
  }
}
```

## Usage Patterns for LLMs

### Initial Analysis Workflow

1. **Start with repository context**:

   ```
   get_repository_info -> understand what you're analyzing
   ```

2. **Explore project structure**:

   ```
   get_file_structure -> navigate and understand organization
   ```

3. **Identify problem areas**:

   ```
   detect_hotspots -> find files that need attention
   analyze_trends -> understand quality evolution
   ```

4. **Deep dive into specific files**:
   ```
   xray_analyze -> detailed analysis of problematic files
   ```

### Analysis Scenarios

#### "What are the biggest problems in this codebase?"

1. `get_repository_info` - Understand the project
2. `detect_hotspots` with `metric: "McCabe"` - Find complex, frequently changed files
3. `analyze_trends` with `maxCommits: 100` - See quality trends
4. `xray_analyze` on top hotspots - Understand specific issues

#### "How has code quality changed recently?"

1. `get_repository_info` - Get context
2. `analyze_trends` with `maxCommits: 50` - Recent quality trends
3. `detect_hotspots` - Current problem areas
4. Compare results to understand deterioration patterns

#### "Analyze this specific file"

1. `xray_analyze` with target file - Detailed metrics
2. `analyze_trends` filtered to that file - Historical context
3. Provide specific recommendations based on metrics

### Interpreting Results

#### Complexity Scores

- **0-10**: Simple, well-structured code
- **11-20**: Moderate complexity, acceptable
- **21-50**: High complexity, consider refactoring
- **50+**: Very high complexity, needs immediate attention

#### Hotspot Scores

- **Low scores (0-100)**: Normal files, no immediate concern
- **Medium scores (100-500)**: Files to monitor
- **High scores (500-1000)**: Files needing attention
- **Critical scores (1000+)**: Urgent refactoring candidates

#### Change Frequency Patterns

- **High changes + High complexity**: Critical hotspot - needs refactoring
- **High changes + Low complexity**: Active development area - good
- **Low changes + High complexity**: Technical debt - schedule refactoring
- **Low changes + Low complexity**: Stable code - good

## Installation and Setup

### Prerequisites

- Node.js 20.17.0 or higher
- npm 10.8.2 or higher
- A TypeScript/JavaScript project with git history

### Building the MCP Server

```bash
# Build the Detective backend (includes MCP server)
npm run mcp:build

# Or build everything
npm run build
```

### Testing the Server

```bash
# Test with MCP inspector tool
npm run mcp:inspect
```

### Running the Server

The MCP server supports two transport modes:

#### STDIO Transport (Default)

Best for integration with Claude Desktop and other MCP clients:

```bash
# Run the MCP server with STDIO transport
npm run mcp:serve

# Development mode with auto-restart
npm run mcp:dev
```

#### Streamable HTTP Transport

Best for web applications and streaming responses:

```bash
# Run the MCP server with HTTP transport on port 3001
npm run mcp:serve:http

# Development mode with HTTP transport
npm run mcp:dev:http

# Custom port
MCP_PORT=4000 MCP_TRANSPORT=http npm run mcp:serve
```

### Streaming Support

The MCP server supports **real-time streaming** for long-running operations like trend analysis:

- **STDIO Transport**: Streaming handled via MCP protocol
- **HTTP Transport**: Uses Streamable HTTP for real-time updates
- Add `"streaming": true` to tool parameters to enable streaming
- Currently supported by: `analyze_trends`

## Integration with AI Assistants

### Claude Desktop Configuration

For **STDIO transport** (default), add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "detective": {
      "command": "node",
      "args": ["/absolute/path/to/detective/dist/apps/backend/src/mcp/index.js"],
      "cwd": "/path/to/repository/you/want/to/analyze"
    }
  }
}
```

For **Streamable HTTP transport**, use:

```json
{
  "mcpServers": {
    "detective": {
      "command": "node",
      "args": ["/absolute/path/to/detective/dist/apps/backend/src/mcp/index.js", "http"],
      "env": {
        "MCP_PORT": "3001"
      },
      "cwd": "/path/to/repository/you/want/to/analyze"
    }
  }
}
```

**Important**:

- Use absolute paths for the `command` and `args`
- Set `cwd` to the repository you want to analyze
- For streaming support, use HTTP transport
- The MCP server will analyze the repository specified in `cwd`

### Example Claude Desktop Config Locations

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

### Testing the Integration

1. Start Claude Desktop
2. Verify the MCP server appears in Claude's tools
3. Test with: "What repository am I working with?" (should call `get_repository_info`)
4. Test analysis: "Find the hotspots in this codebase" (should call `detect_hotspots`)

### Using Streaming Features

When using the HTTP transport, you can enable streaming for long-running operations:

```bash
# Example API call with streaming enabled
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "analyze_trends",
      "arguments": {
        "maxCommits": 100,
        "streaming": true
      }
    }
  }'
```

**For LLMs**: Simply add `"streaming": true` to your tool call parameters:

- "Analyze trends for the last 100 commits with streaming enabled"
- The LLM will receive real-time progress updates during analysis

## Advanced Usage

### Custom Analysis Workflows

The MCP server enables sophisticated analysis workflows:

```javascript
// Example workflow for code review
1. get_repository_info()           // Understand context
2. analyze_trends(maxCommits: 20)  // Recent changes
3. detect_hotspots(minScore: 100)  // Problem areas
4. xray_analyze() on each hotspot  // Detailed analysis
5. get_file_structure()            // Navigate to related files
```

### Performance Considerations

- **Trend analysis**: Can be slow for large repositories or many commits
- **X-ray analysis**: Fast for individual files
- **Hotspot detection**: Moderate speed, depends on git history size
- **File structure**: Fast for most projects

### Limitations

- Supports TypeScript/JavaScript projects primarily
- Requires git history for trend analysis and hotspot detection
- File size limits may apply for very large files
- Complex monorepos may require longer processing times

## Troubleshooting

### Common Issues

1. **"Path not found" errors**:

   - Ensure `cwd` in MCP config points to correct repository
   - Use absolute paths in configuration

2. **"Not a git repository" warnings**:

   - Some features require git history
   - Initialize git repo or use non-git features only

3. **TypeScript compilation errors**:

   - Run `npm run mcp:build` to compile the server
   - Check TypeScript configuration

4. **Permission errors**:
   - Ensure MCP server has read access to target repository
   - Check file permissions

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=detective-mcp npm run mcp:serve
```

### Getting Help

1. Check server logs for error messages
2. Verify MCP server builds without errors
3. Test with `npm run mcp:inspect` for interactive debugging
4. Ensure target repository has proper git history and file structure

## Architecture

The MCP server is built as a thin wrapper around Detective's existing analysis services:

```
MCP Client (Claude, etc.)
    ↓
MCP Protocol (stdio transport)
    ↓
Detective MCP Server
    ↓
Detective Analysis Services
    ↓
Git Repository + TypeScript Analysis
```

Each tool is implemented as a type-safe wrapper that:

1. Validates inputs using Zod schemas
2. Calls existing Detective services
3. Formats results for MCP consumption
4. Provides comprehensive error handling

This architecture ensures the MCP server is maintainable, reliable, and leverages Detective's proven analysis capabilities.
