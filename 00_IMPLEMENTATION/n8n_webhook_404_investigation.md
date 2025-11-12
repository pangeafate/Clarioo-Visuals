# N8N Webhook 404 Investigation Report

## Issue Summary
The webhook for "Company News Monitor - Fixed" workflow (ID: O0jxbkYnBkNs0V7E) returns 404 despite being active.

## Key Findings

### 1. Webhook Configuration Comparison

#### ❌ Non-Working Webhook (Company News Monitor)
```json
{
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "company-news-monitor",
    "responseMode": "onReceived",
    "options": {}
  },
  "id": "webhook-trigger-001",
  "webhookId": "company-news-monitor"
}
```

#### ✅ Working Webhook (riverstrom-ai-with-promo-v2)
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "contact-form",
    "responseMode": "responseNode",
    "options": {}
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [-1776, 176],
  "id": "5420192c-bbca-4b26-b849-b3811eeed60a",
  "name": "Webhook",
  "webhookId": "f8405f15-d0ea-475f-93c0-4dc96c5f3473"
}
```

### 2. Critical Differences

| Feature | Non-Working | Working |
|---------|-------------|---------|
| **typeVersion** | Missing | 2 |
| **responseMode** | "onReceived" | "responseNode" |
| **webhookId** | "company-news-monitor" (custom) | "f8405f15-d0ea-475f-93c0-4dc96c5f3473" (UUID) |
| **Respond Node** | Missing | Present (Respond to Webhook1) |
| **Node Position** | [240, 200] | [-1776, 176] |

### 3. Workflow Structure Analysis

#### Company News Monitor Flow
```
Webhook Trigger → Companies List → Split Companies → Search News → Parse RSS → Extract Articles → Format Message → Send to Telegram
```

**Problem**: No response node! The webhook uses `responseMode: "onReceived"` but doesn't properly close the connection.

#### Working Workflow Flow
```
Webhook → Edit Fields → If (validation) → Send to Telegram → Check if Kovalskii → Respond to Webhook1
                                      ↓
                               Respond to Webhook (error)
```

**Success Factor**: Has dedicated "Respond to Webhook" nodes that properly close the HTTP connection.

### 4. Root Cause Analysis

The webhook is returning 404 because:

1. **Missing typeVersion**: The webhook node doesn't specify `typeVersion: 2`
2. **Wrong responseMode**: Using "onReceived" but not properly implementing it
3. **No Response Node**: The workflow doesn't have a "Respond to Webhook" node
4. **Custom webhookId**: Using a custom string instead of UUID might cause routing issues

### 5. The Real Problem: Test vs Production Webhooks

Looking at the working webhook, n8n has TWO types of webhook URLs:

1. **Test Webhook URL**: `https://sergypod.app.n8n.cloud/webhook-test/{path}`
   - Used during workflow development
   - Active when workflow editor is open
   - Temporary

2. **Production Webhook URL**: `https://sergypod.app.n8n.cloud/webhook/{path}`
   - Used for activated workflows
   - Permanent
   - Requires workflow to be active AND properly configured

### 6. Webhook URL Format Discovery

Based on the working workflow with path "contact-form":
- Production: `https://sergypod.app.n8n.cloud/webhook/contact-form`
- Test: `https://sergypod.app.n8n.cloud/webhook-test/contact-form`

For "company-news-monitor":
- Production: `https://sergypod.app.n8n.cloud/webhook/company-news-monitor`
- Test: `https://sergypod.app.n8n.cloud/webhook-test/company-news-monitor`

## Solutions

### Immediate Fix Options

#### Option 1: Add Respond to Webhook Node (Recommended)
1. Add a "Respond to Webhook" node at the end of the workflow
2. Connect it after "Send to Telegram"
3. Change `responseMode` to "responseNode"

#### Option 2: Fix onReceived Mode
1. Keep `responseMode: "onReceived"`
2. Ensure the webhook immediately returns 200 OK
3. Let the workflow continue processing asynchronously

#### Option 3: Use Schedule Trigger Only
- Remove webhook trigger entirely
- Rely only on the Schedule Trigger (every 6 hours)
- Simpler, no webhook needed

### Recommended Solution: Add Response Node

```json
{
  "name": "Respond to Webhook",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1.4,
  "position": [2000, 300],
  "parameters": {
    "options": {
      "responseCode": 200
    }
  },
  "id": "respond-webhook-001"
}
```

Update webhook node:
```json
{
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [240, 200],
  "parameters": {
    "httpMethod": "POST",
    "path": "company-news-monitor",
    "responseMode": "responseNode",
    "options": {}
  },
  "id": "webhook-trigger-001",
  "webhookId": "f8405f15-d0ea-475f-93c0-4dc96c5f3473"
}
```

Add connection:
```json
"Send to Telegram": {
  "main": [
    [
      {
        "node": "Respond to Webhook",
        "type": "main",
        "index": 0
      }
    ]
  ]
}
```

## Testing Plan

1. **Update the workflow** with the response node
2. **Test with curl**:
   ```bash
   curl -X POST https://sergypod.app.n8n.cloud/webhook/company-news-monitor \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
3. **Verify**:
   - Should return 200 OK
   - Workflow should execute
   - Telegram should receive messages

## Next Steps

1. ✅ Identified root cause (missing response node + wrong configuration)
2. ⏳ Update workflow configuration with response node
3. ⏳ Test webhook endpoint
4. ⏳ Verify Telegram notifications work
5. ⏳ Document final working configuration

## Additional Notes

- The workflow has 2 triggers: Webhook + Schedule (every 6 hours)
- Schedule trigger works fine and doesn't need fixing
- Webhook trigger is optional - workflow can function without it
- If webhook is not needed, consider removing it to simplify the workflow
