import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScanReport, ScanReportWithInsights, FileReport, FileInsight } from '../models/report';

// Lazy-initialize Gemini client (after env vars are loaded)
function getGeminiModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

/**
 * Build prompt for overall summary
 */
function buildOverallSummaryPrompt(report: ScanReport): string {
  const totalFindings = report.files.reduce((sum, f) => sum + f.findings.length, 0);
  const highRiskFiles = report.files.filter(f => f.overallRisk === 'HIGH' || f.overallRisk === 'CRITICAL');

  return `You are a security analyst reviewing a configuration scan report.

SCAN SUMMARY:
- Total files scanned: ${report.files.length}
- Total findings: ${totalFindings}
- Files with HIGH/CRITICAL risk: ${highRiskFiles.length}

FILES BREAKDOWN:
${report.files.map(f => `- ${f.path} (${f.configType}): ${f.overallRisk} risk, score ${f.overallScore}, ${f.findings.length} findings`).join('\n')}

INSTRUCTIONS:
1. Provide a concise executive summary (2-4 sentences) of the overall security posture
2. Highlight the most critical issues if any
3. DO NOT invent or change risk scores - only comment on what's provided
4. DO NOT output YAML/JSON unless asked
5. Be specific and actionable

Format your response as plain text, focusing on key takeaways.`;
}

/**
 * Build prompt for per-file insights
 */
function buildFilePrompt(file: FileReport): string {
  return `You are a security analyst reviewing a specific configuration file.

FILE: ${file.path}
TYPE: ${file.configType}
RISK LEVEL: ${file.overallRisk}
SCORE: ${file.overallScore}

FINDINGS (${file.findings.length} total):
${file.findings.map(f => `
- [${f.severity}] ${f.id}
  Description: ${f.description}
  Recommendation: ${f.recommendation}
`).join('\n')}

INSTRUCTIONS:
1. Provide a concise summary (2-4 sentences) explaining what's wrong with this configuration
2. List 3-5 specific, actionable suggestions for improvement
3. DO NOT invent findings or change risk scores
4. DO NOT output code examples unless critical
5. Base your analysis ONLY on the findings provided above

Format your response EXACTLY as:

Summary:
[Your 2-4 sentence summary here]

Suggestions:
- [First suggestion]
- [Second suggestion]
- [Third suggestion]
- [Fourth suggestion (if applicable)]
- [Fifth suggestion (if applicable)]`;
}

/**
 * Parse LLM response into summary + suggestions
 */
function parseLlmResponse(llmText: string): { summary: string; suggestions: string[] } {
  const lines = llmText.trim().split('\n');
  
  let summary = '';
  const suggestions: string[] = [];
  let mode: 'summary' | 'suggestions' | 'none' = 'none';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().startsWith('summary:')) {
      mode = 'summary';
      const summaryContent = trimmed.substring('summary:'.length).trim();
      if (summaryContent) {
        summary = summaryContent;
      }
      continue;
    }
    
    if (trimmed.toLowerCase().startsWith('suggestions:')) {
      mode = 'suggestions';
      continue;
    }
    
    if (mode === 'summary' && trimmed) {
      summary += (summary ? ' ' : '') + trimmed;
    }
    
    if (mode === 'suggestions' && trimmed.startsWith('-')) {
      suggestions.push(trimmed.substring(1).trim());
    }
  }

  // Fallback if parsing fails
  if (!summary) {
    summary = 'Configuration has security findings that should be addressed.';
  }
  if (suggestions.length === 0) {
    suggestions.push('Review all findings and apply recommended fixes.');
  }

  return { summary, suggestions };
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt: string): Promise<string> {
  const model = getGeminiModel();
  if (!model) {
    throw new Error('Gemini model not initialized. Please set GOOGLE_API_KEY in your .env file.');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Enrich a scan report with LLM insights
 */
export async function enrichReportWithLlm(report: ScanReport): Promise<ScanReportWithInsights> {
  const model = getGeminiModel();
  if (!model) {
    console.warn('⚠️  GOOGLE_API_KEY not set. LLM enrichment disabled.');
    console.warn('   Create a .env file with: GOOGLE_API_KEY=your_key_here');
    
    // Return a basic enriched report without LLM
    return {
      ...report,
      overallSummary: 'LLM enrichment not available (API key not configured).',
      insights: report.files.map(file => ({
        path: file.path,
        configType: file.configType,
        overallRisk: file.overallRisk,
        overallScore: file.overallScore,
        summary: `File has ${file.findings.length} findings with ${file.overallRisk} risk.`,
        suggestions: ['Configure GOOGLE_API_KEY to enable LLM insights.'],
      })),
    };
  }

  console.log('🤖 Enriching report with Gemini AI insights...');

  try {
    // 1) Generate overall summary
    console.log('   → Generating overall summary...');
    const overallPrompt = buildOverallSummaryPrompt(report);
    const overallSummary = await callGemini(overallPrompt);

    // 2) Generate per-file insights
    const insights: FileInsight[] = [];
    for (const file of report.files) {
      console.log(`   → Analyzing ${file.path}...`);
      const filePrompt = buildFilePrompt(file);
      const llmText = await callGemini(filePrompt);
      
      const { summary, suggestions } = parseLlmResponse(llmText);
      
      insights.push({
        path: file.path,
        configType: file.configType,
        overallRisk: file.overallRisk,
        overallScore: file.overallScore,
        summary,
        suggestions,
      });
    }

    console.log('✅ LLM enrichment complete!');

    return {
      ...report,
      overallSummary: overallSummary.trim(),
      insights,
    };
  } catch (error) {
    console.error('❌ LLM enrichment failed:', error);
    throw error;
  }
}
