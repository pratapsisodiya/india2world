import OpenAI from "openai";
import { matchSchemes } from "../schemeMatcher/schemeMatcherService";
import { classifyHsCode } from "../hsClassifier/hsClassifierService";
import { findBuyers } from "../buyerFinder/buyerFinderService";
import { screenEntity } from "../compliance/complianceService";

export const CHAT_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "classify_hs_code",
      description:
        "Look up the correct ITC-HS tariff chapter and heading for an Indian export product. " +
        "Call this whenever the user asks about HS codes, ITC-HS codes, tariff classification, " +
        "or which chapter/heading their product falls under.",
      parameters: {
        type: "object",
        properties: {
          productDescription: {
            type: "string",
            description: "The product to classify (e.g. 'handwoven cotton sarees', 'black pepper whole').",
          },
          sector: {
            type: "string",
            description: "Export sector if known (e.g. 'Textiles', 'Spices & Agriculture').",
          },
          additionalContext: {
            type: "string",
            description: "Any extra context to narrow the classification.",
          },
        },
        required: ["productDescription"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "match_export_schemes",
      description:
        "Find Indian government export incentive schemes (RoDTEP, EPCG, duty drawback, advance " +
        "authorisation, RoSCTL, SEIS, etc.) that the user's business qualifies for. " +
        "Call this whenever the user asks about export incentives, subsidies, duty refunds, " +
        "or financial support schemes for exports.",
      parameters: {
        type: "object",
        properties: {
          sector: {
            type: "string",
            description: "Export sector (e.g. 'Textiles & Apparel', 'Pharmaceuticals', 'IT & Software').",
          },
          exportProducts: {
            type: "string",
            description: "Products the user exports.",
          },
          businessType: {
            type: "string",
            enum: ["manufacturer", "merchant", "service", "unknown"],
            description: "Type of business.",
          },
          exportStage: {
            type: "string",
            enum: ["planning", "registered", "first-shipment", "scaling"],
            description: "Current stage in the exporter's journey.",
          },
          hasIEC: {
            type: "boolean",
            description: "Whether the exporter holds an IEC.",
          },
          hasGST: {
            type: "boolean",
            description: "Whether the exporter is GST registered.",
          },
          targetMarkets: {
            type: "array",
            items: { type: "string" },
            description: "Target export countries.",
          },
        },
        required: ["sector", "exportProducts"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_buyers",
      description:
        "Search for real international importers, distributors, or buyers for an Indian product " +
        "in a specific country. Call this when the user wants to know who to sell to, " +
        "how to find buyers, or wants leads in a specific target market.",
      parameters: {
        type: "object",
        properties: {
          product: {
            type: "string",
            description: "The product to find buyers for.",
          },
          targetCountry: {
            type: "string",
            description: "The country to find buyers in.",
          },
          hsCode: {
            type: "string",
            description: "HS code if already known (optional).",
          },
          sector: {
            type: "string",
            description: "Export sector (optional).",
          },
        },
        required: ["product", "targetCountry"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "screen_compliance",
      description:
        "Screen a company, individual, or vessel for trade compliance risks — OFAC SDN, " +
        "BIS Entity List, UN/EU sanctions, and country-level embargoes. " +
        "Call this when the user asks whether it is safe to trade with a specific company or country, " +
        "or wants a sanctions/compliance check before proceeding with a transaction.",
      parameters: {
        type: "object",
        properties: {
          entityName: {
            type: "string",
            description: "Name of the company, person, or vessel to screen.",
          },
          country: {
            type: "string",
            description: "Country of the entity.",
          },
          entityType: {
            type: "string",
            enum: ["company", "individual", "vessel", "unknown"],
            description: "Type of entity.",
          },
        },
        required: ["entityName", "country"],
      },
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  signal: AbortSignal,
): Promise<string> {
  switch (name) {
    case "classify_hs_code": {
      const result = await classifyHsCode(
        {
          productDescription: String(args.productDescription ?? ""),
          sector: args.sector ? String(args.sector) : undefined,
          additionalContext: args.additionalContext ? String(args.additionalContext) : undefined,
        },
        signal,
      );
      return JSON.stringify(result);
    }

    case "match_export_schemes": {
      const validStages = ["planning", "registered", "first-shipment", "scaling"];
      const validTypes = ["manufacturer", "merchant", "service", "unknown"];
      const result = await matchSchemes(
        {
          sector: String(args.sector ?? "general"),
          exportProducts: String(args.exportProducts ?? ""),
          businessType: (validTypes.includes(String(args.businessType))
            ? args.businessType
            : "unknown") as "manufacturer" | "merchant" | "service" | "unknown",
          exportStage: (validStages.includes(String(args.exportStage))
            ? args.exportStage
            : undefined) as "planning" | "registered" | "first-shipment" | "scaling" | undefined,
          hasIEC: args.hasIEC != null ? Boolean(args.hasIEC) : undefined,
          hasGST: args.hasGST != null ? Boolean(args.hasGST) : undefined,
          targetMarkets: Array.isArray(args.targetMarkets)
            ? (args.targetMarkets as string[])
            : undefined,
          location: args.location ? String(args.location) : undefined,
          annualTurnover: args.annualTurnover ? String(args.annualTurnover) : undefined,
        },
        signal,
      );
      return JSON.stringify(result);
    }

    case "find_buyers": {
      const result = await findBuyers(
        {
          product: String(args.product ?? ""),
          targetCountry: String(args.targetCountry ?? ""),
          hsCode: args.hsCode ? String(args.hsCode) : undefined,
          sector: args.sector ? String(args.sector) : undefined,
        },
        signal,
      );
      return JSON.stringify(result);
    }

    case "screen_compliance": {
      const validEntityTypes = ["company", "individual", "vessel", "unknown"];
      const result = await screenEntity(
        {
          entityName: String(args.entityName ?? ""),
          country: String(args.country ?? ""),
          entityType: (validEntityTypes.includes(String(args.entityType))
            ? args.entityType
            : "unknown") as "company" | "individual" | "vessel" | "unknown",
        },
        signal,
      );
      return JSON.stringify(result);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
