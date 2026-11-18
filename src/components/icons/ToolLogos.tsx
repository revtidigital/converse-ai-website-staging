import React from "react";

interface ToolLogoProps {
  name: string;
  className?: string;
}

export const ToolLogo: React.FC<ToolLogoProps> = ({ name, className = "w-4 h-4" }) => {
  const norm = name.toLowerCase().trim();

  // 1. Salesforce
  if (norm.includes("salesforce")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
          fill="#00A1E0"
        />
        <path
          d="M7.8 11.2c.4-.6 1-.9 1.7-1.1-.2.4-.3.9-.3 1.4 0 .3 0 .6.1.9-.5-.2-1-.5-1.5-1.2zm3.8-2.4c.6-.3 1.3-.4 2.1-.4.9 0 1.7.2 2.5.5-.4.4-1 .6-1.6.8-.8.2-1.6.2-2.4-.2-.2-.2-.4-.5-.6-.7zm4.2 2.8c.4-.2.8-.2 1.3-.2.8 0 1.5.2 2.2.6-.4.3-.8.5-1.3.6-.8.2-1.5.1-2.2-.4v-.6z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 2. HubSpot
  if (norm.includes("hubspot")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18.8 6.8V4.5a2 2 0 10-2.5 1.9v.4l-6 3.5a3.8 3.8 0 00-2.3-.8 4 4 0 104 4c0-.4 0-.7-.1-1.1l5.4-3.1a2 2 0 001.5.4 2 2 0 000-2.9zm-1.2-2.8a.8.8 0 110 1.6.8.8 0 010-1.6zM8 15.2a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8zm9.6-6.8a.8.8 0 110-1.6.8.8 0 010 1.6z"
          fill="#FF7A59"
        />
      </svg>
    );
  }

  // 3. Zoho CRM & Zoho Books
  if (norm.includes("zoho")) {
    if (norm.includes("books")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2" fill="#1C69D3" />
          <path d="M7 4v16M11 8h6M11 12h6M11 16h4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="5" cy="8" r="1" fill="#F4AE24" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="9" height="9" rx="2" fill="#E42527" />
        <rect x="13" y="2" width="9" height="9" rx="2" fill="#2BA84A" />
        <rect x="2" y="13" width="9" height="9" rx="2" fill="#1C69D3" />
        <rect x="13" y="13" width="9" height="9" rx="2" fill="#F4AE24" />
      </svg>
    );
  }

  // 4. Pipedrive
  if (norm.includes("pipedrive")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#00AA44" />
        <path
          d="M9 17V7h4a3.5 3.5 0 010 7h-2.5"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 5. LeadSquared
  if (norm.includes("leadsquared")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#F36C21" />
        <path d="M6 13l4 4 8-8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 6. Zendesk
  if (norm.includes("zendesk")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4a8 8 0 00-8 8h8V4z" fill="#03363D" />
        <path d="M12 20a8 8 0 008-8h-8v8z" fill="#03363D" />
        <path d="M12 12V4h8a8 8 0 01-8 8z" fill="#03363D" opacity="0.8" />
        <path d="M12 12v8H4a8 8 0 018-8z" fill="#03363D" opacity="0.8" />
      </svg>
    );
  }

  // 7. Freshdesk
  if (norm.includes("freshdesk")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="4" fill="#00C9A7" />
        <circle cx="6" cy="12" r="4" fill="#FFC75F" />
        <circle cx="18" cy="12" r="4" fill="#FF8066" />
        <circle cx="12" cy="18" r="4" fill="#845EC2" />
      </svg>
    );
  }

  // 8. Intercom
  if (norm.includes("intercom")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="5" fill="#286EFA" />
        <path
          d="M7 8v7M9.5 7v9M12 6.5v9.5M14.5 7v9M17 8v7"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M8 17.5c2 1.3 6 1.3 8 0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 9. ServiceNow
  if (norm.includes("servicenow")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#032D42" />
        <path
          d="M12 6a6 6 0 104.24 10.24L14.83 14.8A4 4 0 1112 8a3.95 3.95 0 012.83 1.17l1.41-1.41A5.96 5.96 0 0012 6z"
          fill="#81B5A1"
        />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#81B5A1" />
      </svg>
    );
  }

  // 10. Jira Service Management
  if (norm.includes("jira")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11.5 2.5a9.5 9.5 0 000 19l4.5-4.5a4 4 0 000-5.6l-4.5-4.5a3.5 3.5 0 010-4.4z"
          fill="#2684FF"
        />
        <path
          d="M12 2.5l-4.5 4.5a4 4 0 000 5.6l4.5 4.5a3.5 3.5 0 010 4.4 9.5 9.5 0 000-19z"
          fill="#0052CC"
        />
        <path d="M12 7l2.5 2.5a2 2 0 010 2.8L12 14.8V7z" fill="#0052CC" />
      </svg>
    );
  }

  // 11. SAP
  if (norm.includes("sap")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#008FD3" />
        <text
          x="12"
          y="15.5"
          fill="#ffffff"
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          SAP
        </text>
      </svg>
    );
  }

  // 12. Oracle
  if (norm.includes("oracle")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="7" width="20" height="10" rx="5" fill="#C74634" />
        <rect x="6" y="9.5" width="12" height="5" rx="2.5" fill="#ffffff" />
      </svg>
    );
  }

  // 13. NetSuite
  if (norm.includes("netsuite")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#1F4788" />
        <path d="M6 18V6l7 12V6" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 18V6" stroke="#00A1E0" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  // 14. Dynamics
  if (norm.includes("dynamics")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h7v7H4V4z" fill="#0078D4" />
        <path d="M13 4h7v7h-7V4z" fill="#2B88D8" />
        <path d="M4 13h7v7H4v-7z" fill="#005A9E" />
        <path d="M13 13h7v7h-7v-7z" fill="#004578" />
        <path d="M6 18l12-12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 15. Tally
  if (norm.includes("tally")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#E31E24" />
        <text
          x="12"
          y="16.5"
          fill="#ffffff"
          fontSize="13"
          fontWeight="bold"
          fontStyle="italic"
          fontFamily="serif"
          textAnchor="middle"
        >
          T
        </text>
      </svg>
    );
  }

  // 16. QuickBooks
  if (norm.includes("quickbooks")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#2CA01C" />
        <path
          d="M8.5 7.5v8a2.5 2.5 0 002.5 2.5h.5V16h-.5a1 1 0 01-1-1v-4a2.5 2.5 0 012.5-2.5h.5V7H11a2.5 2.5 0 00-2.5.5z"
          fill="#ffffff"
        />
        <path
          d="M15.5 16.5v-8a2.5 2.5 0 00-2.5-2.5H12.5V7h.5a1 1 0 011 1v4a2.5 2.5 0 01-2.5 2.5h-.5V16H13a2.5 2.5 0 002.5.5z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 17. Xero
  if (norm.includes("xero")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#13B5EA" />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 18. Snowflake
  if (norm.includes("snowflake")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
          stroke="#29B5E8"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2" fill="#29B5E8" />
        <path
          d="M12 5l-2 2M12 5l2 2M12 19l-2-2M12 19l2-2M5 12l2-2M5 12l2 2M19 12l-2-2M19 12l2 2"
          stroke="#29B5E8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 19. BigQuery
  if (norm.includes("bigquery")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="#4285F4" />
        <circle cx="10" cy="11" r="4" stroke="#ffffff" strokeWidth="1.8" />
        <path d="M13 14l4 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 11h4M10 9v4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // 20. Postgres
  if (norm.includes("postgres")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#336791" />
        <path
          d="M12 5c-3 0-5 2-5 5 0 2.5 1.5 4.5 3.5 5v3.5c0 .3.2.5.5.5h2c.3 0 .5-.2.5-.5V15c2-.5 3.5-2.5 3.5-5 0-3-2-5-4.5-5z"
          fill="#ffffff"
        />
        <circle cx="10" cy="9.5" r="1" fill="#336791" />
        <circle cx="14" cy="9.5" r="1" fill="#336791" />
      </svg>
    );
  }

  // 21. Slack
  if (norm.includes("slack")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 14.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm1.5-1.5H6a1.5 1.5 0 000 3h1.5v-3z" fill="#E01E5A" />
        <path d="M9.5 6a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm0 1.5V6a1.5 1.5 0 00-3 0v1.5h3z" fill="#36C5F0" />
        <path d="M18 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-1.5 1.5H18a1.5 1.5 0 000-3h-1.5v3z" fill="#2EB67D" />
        <path d="M14.5 18a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm0-1.5V18a1.5 1.5 0 003 0v-1.5h-3z" fill="#ECB22E" />
      </svg>
    );
  }

  // 22. Teams
  if (norm.includes("teams")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="14" height="18" rx="2" fill="#5059C9" />
        <circle cx="18.5" cy="8" r="2.5" fill="#7B83EB" />
        <path d="M16 13h5a2 2 0 012 2v2h-7v-4z" fill="#7B83EB" />
        <text
          x="9"
          y="15.5"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          T
        </text>
      </svg>
    );
  }

  // 23. Google Workspace
  if (norm.includes("google") || norm.includes("workspace")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  // 24. Microsoft 365
  if (norm.includes("microsoft 365") || norm.includes("office 365") || norm.includes("m365")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 6.5v11L12 22l8-4.5v-11L12 2z" fill="#EB3C00" />
        <path d="M12 5.5l5.5 3v7L12 18.5l-5.5-3v-7L12 5.5z" fill="#FF8C00" opacity="0.8" />
        <circle cx="12" cy="12" r="3" fill="#ffffff" />
      </svg>
    );
  }

  // 25. Notion
  if (norm.includes("notion")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#000000" />
        <path
          d="M7 17.5V7.8l3.6 5.8 4-5.8v9.7"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 26. Confluence
  if (norm.includes("confluence")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.5 15.5c2-3 5-4.5 8-4.5s6 1.5 7 4.5c-2 3-5 4.5-8 4.5s-6-1.5-7-4.5z"
          fill="#0052CC"
        />
        <path
          d="M19.5 8.5c-2 3-5 4.5-8 4.5s-6-1.5-7-4.5c2-3 5-4.5 8-4.5s6 1.5 7 4.5z"
          fill="#2684FF"
        />
      </svg>
    );
  }

  // 27. SharePoint
  if (norm.includes("sharepoint")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="8" r="5" fill="#008272" />
        <circle cx="9" cy="14" r="6" fill="#038387" />
        <text
          x="9"
          y="17"
          fill="#ffffff"
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          S
        </text>
      </svg>
    );
  }

  // 28. Legacy, on-prem, homegrown tools
  if (norm.includes("legacy") || norm.includes("on-prem") || norm.includes("homegrown")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="7" rx="2" fill="#475569" />
        <rect x="2" y="14" width="20" height="7" rx="2" fill="#334155" />
        <circle cx="6" cy="6.5" r="1.2" fill="#10B981" />
        <circle cx="9" cy="6.5" r="1.2" fill="#38BDF8" />
        <circle cx="6" cy="17.5" r="1.2" fill="#10B981" />
        <circle cx="9" cy="17.5" r="1.2" fill="#38BDF8" />
        <path d="M15 6.5h3M15 17.5h3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 29. Excel-driven workflows
  if (norm.includes("excel")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#107C41" />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Default fallback icon
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#6366F1" />
      <path d="M8 12h8M12 8v8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default ToolLogo;
