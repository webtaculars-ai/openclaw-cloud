# 🔒 SECURITY AUDIT & FIXES - OpenPaw

**Date:** 2026-02-17
**Status:** IN PROGRESS

---

## 1. AUTHENTICATION & AUTHORIZATION

### Current State
- ✅ AWS Cognito for user authentication
- ✅ JWT tokens in Authorization header
- ✅ API Gateway with Cognito authorizer
- ❌ Token refresh strategy unclear
- ❌ Session timeout not configured

### Issues Found

#### HIGH: Session Management
**Problem:** No explicit session timeout or refresh token handling
**Risk:** Stale sessions, security tokens exposed
**Fix:**
- Set Cognito session to 1 hour
- Implement refresh token rotation
- Auto-logout on token expiration

#### MEDIUM: Password Policy
**Problem:** Need to verify Cognito password requirements
**Risk:** Weak passwords
**Current:** Default Cognito (8+ chars)
**Recommendation:** 
- Min 12 characters
- Require: uppercase, lowercase, number, special
- No common passwords

#### MEDIUM: MFA Not Enabled
**Problem:** No multi-factor authentication
**Risk:** Account takeover
**Fix:** Enable optional TOTP MFA in Cognito

---

## 2. API SECURITY

### Current State
- ✅ HTTPS enforced (CloudFront + ACM)
- ✅ CORS configured
- ❌ Rate limiting not configured
- ❌ Input validation incomplete
- ❌ No WAF

### Issues Found

#### HIGH: No Rate Limiting
**Problem:** API Gateway has default throttling (10K req/s)
**Risk:** DDoS, credential stuffing, brute force
**Fix:** Add per-user rate limits
```
Per user: 10 req/s, 1000 req/day
Anonymous: Block or very strict limits
```

#### HIGH: Input Validation Missing
**Problem:** Backend handlers don't validate all inputs
**Risk:** Injection attacks, data corruption
**Fix:** Add validation to all Lambda handlers

#### MEDIUM: CORS Too Permissive
**Problem:** `allowOrigins: ALL_ORIGINS`
**Risk:** CSRF potential
**Current Fix:**
```typescript
allowOrigins: ['https://openpaw.co', 'https://www.openpaw.co']
```

#### MEDIUM: No WAF
**Problem:** No Web Application Firewall
**Risk:** OWASP Top 10 vulnerabilities
**Recommendation:** AWS WAF with managed rule sets

---

## 3. DATA SECURITY

### Current State
- ✅ DynamoDB encryption at rest (AWS managed)
- ✅ HTTPS in transit
- ❌ No field-level encryption
- ❌ PII not specifically protected

### Issues Found

#### HIGH: Promo Codes Stored in Plain Text
**Problem:** Promo codes in DynamoDB not encrypted
**Risk:** If DB compromised, all codes exposed
**Fix:** One-way hash codes, store hash not plaintext

#### MEDIUM: User Data Not Sanitized
**Problem:** User inputs (emails, names) not sanitized
**Risk:** XSS if reflected, data corruption
**Fix:** Sanitize all user inputs

#### LOW: No Data Retention Policy
**Problem:** Data kept indefinitely
**Risk:** GDPR/compliance issues
**Recommendation:** 
- Active users: keep data
- Inactive 2+ years: anonymize or delete
- Delete requests: honor within 30 days

---

## 4. FRONTEND SECURITY

### Current State
- ✅ React (XSS protection built-in)
- ✅ HTTPS only
- ❌ No Content Security Policy
- ❌ Sensitive data in localStorage
- ❌ No subresource integrity

### Issues Found

#### HIGH: Credentials in localStorage
**Problem:** Promo code redemptions tracked in localStorage
**Risk:** XSS can steal, persists across sessions
**Current Code:**
```javascript
localStorage.setItem('usedPromoCodes', JSON.stringify(usedCodes));
```
**Fix:** This is temporary until backend deployed - acceptable

#### HIGH: Missing Security Headers
**Problem:** No CSP, X-Frame-Options, etc.
**Risk:** Clickjacking, XSS, injection
**Fix:** Add via CloudFront response headers

#### MEDIUM: No Subresource Integrity
**Problem:** CDN scripts not validated
**Risk:** Compromised CDN could inject malicious code
**Fix:** Add SRI hashes to external scripts

---

## 5. INFRASTRUCTURE SECURITY

### Current State
- ✅ S3 bucket public read only (not write)
- ✅ CloudFront enforces HTTPS
- ❌ S3 bucket versioning disabled
- ❌ CloudFront logging disabled
- ❌ No intrusion detection

### Issues Found

#### HIGH: No CloudFront Logging
**Problem:** Can't audit access or detect attacks
**Risk:** Blind to security incidents
**Fix:** Enable CloudFront access logs to S3

#### MEDIUM: S3 Bucket Versioning Off
**Problem:** Can't recover from accidental deletion/overwrite
**Risk:** Data loss, can't rollback compromised files
**Fix:** Enable versioning

#### MEDIUM: No CloudWatch Alarms
**Problem:** No alerting on suspicious activity
**Risk:** Slow incident response
**Fix:** Set alarms for:
- High error rates (5xx)
- Unusual traffic patterns
- Failed auth attempts

---

## 6. SECRETS MANAGEMENT

### Current State
- ✅ No secrets in frontend code
- ❌ Environment variables in Lambda (plaintext)
- ❌ No AWS Secrets Manager

### Issues Found

#### HIGH: API Keys in Environment Variables
**Problem:** Stripe/LemonSqueezy keys in Lambda env vars
**Risk:** Visible to anyone with AWS console access
**Fix:** Use AWS Secrets Manager
```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
const secret = await secretsManager.getSecretValue({
  SecretId: 'openpaw/stripe-api-key'
});
```

#### MEDIUM: No Key Rotation
**Problem:** API keys never rotated
**Risk:** Long-lived credentials = higher risk
**Recommendation:** Rotate every 90 days

---

## 7. DEPENDENCY SECURITY

### Current State
- ✅ No known vulnerabilities (npm audit clean)
- ❌ Dependencies not regularly updated
- ❌ No automated vulnerability scanning

### Issues Found

#### MEDIUM: Stale Dependencies
**Problem:** Dependencies may have undiscovered CVEs
**Risk:** Known vulnerabilities over time
**Fix:** 
- Run `npm audit` weekly
- Update dependencies monthly
- Use Dependabot or Snyk

---

## 8. PAYMENT SECURITY

### Current State
- ⏳ Stripe integration pending
- ✅ No card data stored locally
- ❌ Webhook signature verification incomplete

### Issues Found

#### HIGH: Webhook Signature Not Verified (Yet)
**Problem:** LemonSqueezy/Stripe webhooks need verification
**Risk:** Fake payment confirmations
**Current Code:** Handler exists but needs testing
**Fix:** Verify HMAC signature on all webhooks

#### MEDIUM: No PCI Compliance Documentation
**Problem:** Using Stripe (PCI compliant) but no documentation
**Risk:** Compliance audit issues
**Recommendation:** Document that payment handled by Stripe

---

## 9. BUSINESS LOGIC SECURITY

### Current State
- ✅ Promo codes validated server-side (when backend deployed)
- ❌ Race conditions possible
- ❌ Credit balance manipulation possible

### Issues Found

#### HIGH: Race Condition in Promo Redemption
**Problem:** DynamoDB UpdateExpression could allow double-spend
**Risk:** User redeems same code multiple times
**Current Code:**
```typescript
UpdateExpression: 'SET usedCount = :newCount, usedBy = :usedBy'
```
**Fix:** Use conditional expressions
```typescript
ConditionExpression: 'NOT contains(usedBy, :userId)'
```

#### MEDIUM: No Transaction Atomicity
**Problem:** Credit addition + promo marking could partial fail
**Risk:** Credits added but code not marked used (or vice versa)
**Fix:** Use DynamoDB transactions
```typescript
const transaction = new TransactWriteCommand({
  TransactItems: [
    { Update: { /* credits */ } },
    { Update: { /* promo code */ } },
    { Put: { /* transaction log */ } }
  ]
});
```

---

## 10. OPERATIONAL SECURITY

### Current State
- ❌ No incident response plan
- ❌ No security monitoring
- ❌ No backup strategy

### Issues Found

#### HIGH: No Backup/Recovery Plan
**Problem:** Data loss = business loss
**Risk:** Cannot recover from attack or accident
**Fix:**
- Enable DynamoDB point-in-time recovery
- S3 versioning + lifecycle policies
- Regular backup testing

#### HIGH: No Security Monitoring
**Problem:** Can't detect breaches
**Risk:** Attacks go unnoticed
**Fix:** AWS GuardDuty + CloudWatch alarms

#### MEDIUM: No Incident Response Plan
**Problem:** Don't know what to do if breached
**Risk:** Slow, chaotic response
**Fix:** Document:
1. Detect (monitoring alerts)
2. Contain (disable compromised resources)
3. Investigate (logs, forensics)
4. Remediate (fix vulnerability)
5. Notify (users if PII exposed)

---

## FIXES APPLIED NOW

### 1. Secure CORS Configuration
